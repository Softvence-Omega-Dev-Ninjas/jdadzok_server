import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import Stripe from "stripe";

import { CreatePayoutDto } from "./dto/create-payout.dto";
import { ApiResponse } from "./utils/api-response";

@Injectable()
export class StripeService {
    private readonly logger = new Logger(StripeService.name);
    private readonly stripe: Stripe;
    private readonly webhookSecret: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        // Load Stripe secret and webhook secret from config
        const stripeSecret = this.configService.getOrThrow<string>("STRIPE_SECRET");
        this.webhookSecret = this.configService.getOrThrow<string>("STRIPE_WEBHOOK_SECRET");

        // Initialize Stripe client
        this.stripe = new Stripe(stripeSecret);
    }

    /** Create Express Account for Seller */
    async createExpressAccount(userId: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    profile: true,
                    about: true,
                },
            });

            if (!user) throw new NotFoundException("User not found");

            const account = await this.stripe.accounts.create({
                type: "express",
                country: "US",
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                business_type: "individual",
                metadata: { userId, email: user.email },
            });

            await this.prisma.user.update({
                where: { id: userId },
                data: { stripeAccountId: account.id },
            });

            const link = await this.stripe.accountLinks.create({
                account: account.id,
                refresh_url: "https://example.com/refresh",
                return_url: "https://example.com/return",
                type: "account_onboarding",
            });

            return ApiResponse.success("Stripe account created", { url: link.url });
        } catch (error) {
            this.logger.error(error);
            return ApiResponse.error(
                "Stripe account creation failed",
                error instanceof Error ? error.message : "Unknown error",
            );
        }
    }

    /** Get Express Account for Seller */
    async getExpressAccount(userId: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { stripeAccountId: true },
            });

            if (!user || !user.stripeAccountId) {
                throw new NotFoundException("Stripe account not found for this user");
            }

            const account = await this.stripe.accounts.retrieve(user.stripeAccountId);
            const balance = await this.stripe.balance.retrieve({
                stripeAccount: user.stripeAccountId,
            });

            return ApiResponse.success("Stripe account retrieved", {
                id: account.id,
                email: account.email,
                type: account.type,
                charges_enabled: account.charges_enabled,
                payouts_enabled: account.payouts_enabled,
                details_submitted: account.details_submitted,
                capabilities: account.capabilities,
                business_type: account.business_type,
                balance,
            });
        } catch (error) {
            this.logger.error(error);
            return ApiResponse.error(
                "Failed to retrieve Stripe account",
                error instanceof Error ? error.message : "Unknown error",
            );
        }
    }

    /** Handle Seller Payout */
    async handlePayout(sellerId: string, dto: CreatePayoutDto) {
        this.logger.log(`Processing payout for seller ${sellerId}`);

        const seller = await this.prisma.user.findUnique({ where: { id: sellerId } });
        if (!seller) return { status: "error", message: "Seller not found" };

        const amountInCents = Math.round(dto.amount * 100);

        try {
            if (seller.stripeAccountId) {
                const transfer: any = await this.stripe.transfers.create({
                    amount: amountInCents,
                    currency: "usd",
                    destination: seller.stripeAccountId,
                });

                if (!transfer.reversed) {
                    this.logger.log(`Stripe payout successful for ${sellerId}`);
                    return {
                        status: "success",
                        message: "Payout processed successfully",
                        data: transfer,
                    };
                } else {
                    this.logger.warn(`Stripe payout was reversed`, transfer);
                    return { status: "error", message: "Payout was reversed", data: transfer };
                }
            } else {
                await this.prisma.sellerEarnings.upsert({
                    where: { sellerId },
                    update: {
                        totalEarned: { increment: dto.amount },
                        pending: { increment: dto.amount },
                    },
                    create: {
                        sellerId,
                        totalEarned: dto.amount,
                        pending: dto.amount,
                    },
                });
                this.logger.warn(`Seller ${sellerId} has no Stripe account. Marked as pending.`);
                return { status: "success", message: "Payout marked as pending (manual)" };
            }
        } catch (error: any) {
            this.logger.error(error);
            return { status: "error", message: "Payout failed", error: error.message };
        }
    }

    /** Handle Stripe Webhook */
    async handleWebhook(req: Request, signature: string) {
        this.logger.log("Stripe Request", req.body);
        try {
            // Construct the event using raw body (ensure controller provides Buffer)
            const event: Stripe.Event = this.stripe.webhooks.constructEvent(
                req.body,
                signature,
                this.webhookSecret,
            );
            this.logger.log(`Received Stripe event: ${event.type}`);

            switch (event.type) {
                case "payment_intent.succeeded": {
                    const paymentIntent = event.data.object as Stripe.PaymentIntent;
                    const orderId = paymentIntent.metadata.orderId;

                    if (!orderId) {
                        const msg = "PaymentIntent metadata missing orderId";
                        this.logger.error(msg, paymentIntent);
                        return ApiResponse.error(msg);
                    }

                    const order = await this.prisma.order.findUnique({
                        where: { id: orderId },
                        include: { product: { include: { seller: true } } },
                    });

                    if (!order) {
                        const msg = `Order not found: ${orderId}`;
                        this.logger.error(msg);
                        return ApiResponse.error(msg);
                    }

                    await this.prisma.order.update({
                        where: { id: orderId },
                        data: { status: "PAID" },
                    });

                    const adminCommission = order.totalPrice * 0.1;
                    const sellerAmount = order.totalPrice - adminCommission;

                    await this.handlePayout(order.product.sellerId, { amount: sellerAmount });
                    break;
                }

                default: {
                    const msg = `Unhandled Stripe event type: ${event.type}`;
                    this.logger.warn(msg, event);
                    return ApiResponse.success(msg);
                }
            }

            return ApiResponse.success("Webhook processed successfully");
        } catch (err: any) {
            const msg = `Error processing Stripe webhook: ${err.message || err}`;
            this.logger.error(msg, err);
            return ApiResponse.error(msg);
        }
    }
}
