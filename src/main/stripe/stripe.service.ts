import { PrismaService } from "@lib/prisma/prisma.service";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Request } from "express";
import Stripe from "stripe";

import { CreatePayoutDto } from "./dto/create-payout.dto";
import { ApiResponse } from "./utils/api-response";

@Injectable()
export class StripeService {
    private readonly logger = new Logger(StripeService.name);

    constructor(
        @Inject("STRIPE_CLIENT") private readonly stripe: Stripe,
        private readonly prisma: PrismaService,
    ) {}

    /** Create Express Account for Seller */
    async createExpressAccount(userId: string) {
        try {
            const stripeSecret = process.env.STRIPE_SECRET;
            if (!stripeSecret) throw new Error("STRIPE_SECRET environment variable is missing");

            //  create Stripe instance
            const stripe = new Stripe(stripeSecret);

            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    profile: true,
                    about: true,
                },
            });

            if (!user) throw new NotFoundException("user not found");

            // create stripe express account
            const account = await stripe.accounts.create({
                type: "express",
                country: "US",
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                business_type: "individual",
                metadata: { userId, email: user?.email },
            });

            // save account ID in database
            await this.prisma.user.update({
                where: { id: userId },
                data: { stripeAccountId: account.id },
            });

            // generate onboarding link
            const link = await stripe.accountLinks.create({
                account: account.id,
                refresh_url: "https://example.com/refresh",
                return_url: "https://example.com/return",
                type: "account_onboarding",
            });

            return ApiResponse.success("Stripe account created", { url: link.url });
        } catch (error) {
            this.logger.error(error);

            // Return structured error
            return ApiResponse.error(
                "Stripe account creation failed",
                error instanceof Error ? error.message : "Unknown error",
            );
        }
    }

    // get Express Account for user
    async getExpressAccount(userId: string) {
        try {
            const stripeSecret = process.env.STRIPE_SECRET;
            if (!stripeSecret) throw new Error("STRIPE_SECRET environment variable is missing");

            // Create Stripe instance
            const stripe = new Stripe(stripeSecret);
            // Fetch user from DB
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { stripeAccountId: true },
            });

            if (!user || !user.stripeAccountId) {
                throw new NotFoundException("Stripe account not found for this user");
            }

            // retrieve Stripe account details
            const account = await stripe.accounts.retrieve(user.stripeAccountId);

            // retrieve balance for the connected account
            const balance = await stripe.balance.retrieve({
                stripeAccount: user.stripeAccountId,
            });

            // Return relevant information (optional: you can return full object if needed)
            return ApiResponse.success("Stripe account retrieved", {
                id: account.id,
                email: account.email,
                type: account.type,
                charges_enabled: account.charges_enabled,
                payouts_enabled: account.payouts_enabled,
                details_submitted: account.details_submitted,
                capabilities: account.capabilities,
                business_type: account.business_type,
                balance: balance,
            });
        } catch (error) {
            this.logger.error(error);

            return ApiResponse.error(
                "Failed to retrieve Stripe account",
                error instanceof Error ? error.message : "Unknown error",
            );
        }
    }

    // handle seller payout
    async handlePayout(sellerId: string, dto: CreatePayoutDto) {
        this.logger.log(`Processing payout for seller ${sellerId}`);

        const seller = await this.prisma.user.findUnique({ where: { id: sellerId } });
        if (!seller) return { status: "error", message: "Seller not found" };

        const amountInCents = Math.round(dto.amount * 100);

        try {
            if (seller.stripeAccountId) {
                // Stripe payout
                const transfer: any = await this.stripe.transfers.create({
                    amount: amountInCents,
                    currency: "usd",
                    destination: seller.stripeAccountId,
                });

                // Check if transfer is reversed
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
                // Manual payout
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

    // Webhook for Stripe Payment Confirmation
    async handleWebhook(req: Request, signature: string) {
        try {
            const stripeSecret = process.env.STRIPE_SECRET;
            const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

            if (!stripeSecret) {
                const msg = "STRIPE_SECRET environment variable is missing";
                this.logger.error(msg);
                return ApiResponse.error(msg);
            }

            if (!webhookSecret) {
                const msg = "STRIPE_WEBHOOK_SECRET environment variable is missing";
                this.logger.error(msg);
                return ApiResponse.error(msg);
            }

            const stripe = new Stripe(stripeSecret);

            // Construct the event (errors will be caught by outer try/catch)
            const event: Stripe.Event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                webhookSecret,
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

                    // Update order status
                    await this.prisma.order.update({
                        where: { id: orderId },
                        data: { status: "PAID" },
                    });

                    // Calculate admin commission (e.g., 10%)
                    const adminCommission = order.totalPrice * 0.1;
                    const sellerAmount = order.totalPrice - adminCommission;

                    await this.handlePayout(order.product.sellerId, { amount: sellerAmount });

                    break;
                }

                default: {
                    // Handle unhandled events
                    const msg = `Unhandled Stripe event type: ${event.type}`;
                    this.logger.warn(msg, event);
                    return ApiResponse.success(msg); // still returns success to Stripe
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
