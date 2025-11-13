import { PrismaService } from "@lib/prisma/prisma.service";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PaymentStatus } from "@prisma/client";
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
            // 1️⃣ Ensure Stripe secret exists
            const stripeSecret = process.env.STRIPE_SECRET;
            if (!stripeSecret) throw new Error("STRIPE_SECRET environment variable is missing");

            // 2️⃣ Create Stripe instance
            const stripe = new Stripe(stripeSecret);

            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    profile: true,
                    about: true,
                },
            });

            if (!user) throw new NotFoundException("user not found");

            // 3️⃣ Create Stripe Express account
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
            // 4️⃣ Save account ID in database
            await this.prisma.user.update({
                where: { id: userId },
                data: { stripeAccountId: account.id },
            });

            // 5️⃣ Generate onboarding link
            const link = await stripe.accountLinks.create({
                account: account.id,
                refresh_url: "https://example.com/refresh",
                return_url: "https://example.com/return",
                type: "account_onboarding",
            });

            // 6️⃣ Return success
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

    /** Buyer Payment (Checkout Intent) */
    async createPaymentIntent(orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { product: { include: { seller: true } } },
        });

        if (!order) return ApiResponse.error("Order not found");

        const amount = Math.round(order.totalPrice * 100); // in cents

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
                    status: PaymentStatus.CANCELED,
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
    async handleWebhook(event: Stripe.Event) {
        switch (event.type) {
            case "payment_intent.succeeded":
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const orderId = paymentIntent.metadata.orderId;

                await this.prisma.order.update({
                    where: { id: orderId },
                    data: { status: "PAID" },
                });

                // Calculate admin commission (e.g. 10%)
                const order = await this.prisma.order.findUnique({
                    where: { id: orderId },
                    include: { product: { include: { seller: true } } },
                });
                if (!order) {
                    this.logger.error(`Order not found: ${orderId}`);
                    throw new Error("Order not found");
                }

                const adminCommission = order.totalPrice * 0.1;
                const sellerAmount = order.totalPrice - adminCommission;

                await this.handlePayout(order.product.sellerId, sellerAmount);

                break;
            default:
                this.logger.log(`Unhandled Stripe event: ${event.type}`);
        }

        return ApiResponse.success("Webhook processed");
    }
}
