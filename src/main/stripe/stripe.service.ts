import { PrismaService } from "@lib/prisma/prisma.service";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PaymentStatus } from "@prisma/client";
import { Request } from "express";
import Stripe from "stripe";
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
            console.log(account);
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

            // Retrieve Stripe account details
            const account = await stripe.accounts.retrieve(user.stripeAccountId);

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
            });
        } catch (error) {
            this.logger.error(error);

            return ApiResponse.error(
                "Failed to retrieve Stripe account",
                error instanceof Error ? error.message : "Unknown error",
            );
        }
    }

    // buyer payment (checkout intent)
    async createPaymentIntent(orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { product: { include: { seller: true } } },
        });

        if (!order) return ApiResponse.error("Order not found");
        const amount = Math.round(order.totalPrice * 100);
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount,
                currency: "usd",
                automatic_payment_methods: { enabled: true },
                metadata: { orderId },
            });

            await this.prisma.payment.create({
                data: {
                    stripeId: paymentIntent.id,
                    amount: order.totalPrice,
                    status: PaymentStatus.PENDING,
                    orderId: order.id,
                },
            });

            return ApiResponse.success("Payment intent created", {
                clientSecret: paymentIntent.client_secret,
            });
        } catch (error) {
            this.logger.error(error);
            return ApiResponse.error("Failed to create payment intent", error.message);
        }
    }

    /** Handle Seller Payout */
    async handlePayout(sellerId: string, amount: number) {
        this.logger.log(`Processing payout for seller ${sellerId}`);

        const seller = await this.prisma.user.findUnique({ where: { id: sellerId } });
        if (!seller) return ApiResponse.error("Seller not found");

        const amountInCents = Math.round(amount * 100);

        try {
            if (seller.stripeAccountId) {
                // Auto payout via Stripe
                await this.stripe.transfers.create({
                    amount: amountInCents,
                    currency: "usd",
                    destination: seller.stripeAccountId,
                });
                this.logger.log(`Stripe payout successful for ${sellerId}`);
            } else {
                // Manual payout record
                await this.prisma.sellerEarnings.upsert({
                    where: { sellerId },
                    update: {
                        totalEarned: { increment: amount },
                        pending: { increment: amount },
                    },
                    create: {
                        sellerId,
                        totalEarned: amount,
                        pending: amount,
                    },
                });
                this.logger.warn(`Seller ${sellerId} has no Stripe account. Marked as pending.`);
            }

            return ApiResponse.success("Payout processed successfully");
        } catch (error) {
            this.logger.error(error);
            return ApiResponse.error("Payout failed", error.message);
        }
    }

    /** Webhook for Stripe Payment Confirmation */
    async handleWebhook(req: Request, signature: string) {
        try {
            const stripeSecret = process.env.STRIPE_SECRET;
            const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

            if (!stripeSecret) {
                this.logger.error("STRIPE_SECRET environment variable is missing");
                return ApiResponse.error("Server misconfiguration: STRIPE_SECRET missing");
            }

            if (!webhookSecret) {
                this.logger.error("STRIPE_WEBHOOK_SECRET environment variable is missing");
                return ApiResponse.error("Server misconfiguration: STRIPE_WEBHOOK_SECRET missing");
            }

            const stripe = new Stripe(stripeSecret);

            let event: Stripe.Event;
            try {
                event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
            } catch (err) {
                this.logger.error("Webhook signature verification failed", err);
                return ApiResponse.error("Invalid webhook signature");
            }

            this.logger.log(`Received Stripe event: ${event.type}`);

            switch (event.type) {
                case "payment_intent.succeeded": {
                    const paymentIntent = event.data.object as Stripe.PaymentIntent;
                    const orderId = paymentIntent.metadata.orderId;

                    if (!orderId) {
                        this.logger.error("PaymentIntent metadata missing orderId", paymentIntent);
                        return ApiResponse.error("Order ID missing in PaymentIntent metadata");
                    }

                    const order = await this.prisma.order.findUnique({
                        where: { id: orderId },
                        include: { product: { include: { seller: true } } },
                    });

                    if (!order) {
                        this.logger.error(`Order not found: ${orderId}`);
                        return ApiResponse.error("Order not found");
                    }

                    // Update order status
                    await this.prisma.order.update({
                        where: { id: orderId },
                        data: { status: "PAID" },
                    });

                    // Calculate admin commission (e.g. 10%)
                    const adminCommission = order.totalPrice * 0.1;
                    const sellerAmount = order.totalPrice - adminCommission;

                    try {
                        await this.handlePayout(order.product.sellerId, sellerAmount);
                    } catch (err) {
                        this.logger.error(
                            `Failed to process payout for seller ${order.product.sellerId}`,
                            err,
                        );
                        return ApiResponse.error("Failed to process payout");
                    }

                    break;
                }
                default:
                    this.logger.log(`Unhandled Stripe event type: ${event.type}`);
            }

            return ApiResponse.success("Webhook processed successfully");
        } catch (err) {
            this.logger.error("Unexpected error in Stripe webhook handler", err);
            return ApiResponse.error("Internal server error");
        }
    }
}
