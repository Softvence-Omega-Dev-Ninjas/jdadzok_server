import { Injectable, BadRequestException } from "@nestjs/common";
import Stripe from "stripe";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/lib/prisma/prisma.service";
import { OrderStatus } from "@prisma/client";

@Injectable()
export class PaymentsService {
    private stripe: Stripe;

    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
    ) {
        const secret = this.config.get<string>("STRIPE_SECRET");
        if (!secret) throw new Error("Missing STRIPE_SECRET");
        this.stripe = new Stripe(secret, {
            apiVersion: (this.config.get<string>("STRIPE_API_VERSION") ||
                "2025-10-29.clover") as Stripe.LatestApiVersion,
        });
    }

    // create a PaymentIntent for a given order
    async createPaymentIntentForOrder(orderId: string, amount: number, currency = "usd") {
        // amount must be in cents for stripe
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            metadata: { orderId },
        });

        // save payment record
        const payment = await this.prisma.payment.create({
            data: {
                orderId,
                stripePaymentId: paymentIntent.id,
                amount,
                currency,
                status: paymentIntent.status as any, // 'requires_payment_method' / 'requires_confirmation'/ etc
            },
        });

        return {
            clientSecret: paymentIntent.client_secret,
            payment,
            paymentIntentId: paymentIntent.id,
        };
    }

    // get payment by order ID
    async getPaymentByOrder(orderId: string) {
        return this.prisma.payment.findFirst({ where: { orderId } });
    }

    // handle webhook: verify signature, parse event, update payment and order
    async handleStripeWebhook(rawBody: Buffer, sig: string, endpointSecret: string) {
        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
        } catch (err: any) {
            throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
        }

        // handle successful payment
        if (event.type === "payment_intent.succeeded") {
            const pi = event.data.object as Stripe.PaymentIntent;
            const orderId = pi.metadata?.orderId;

            // update payment status
            await this.prisma.payment.updateMany({
                where: { stripePaymentId: pi.id },
                data: { status: "succeeded" },
            });

            if (orderId) {
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: { status: "PAID" }, // adjust to your enum/status
                });
            }
        }

        // handle failed/canceled intents
        if (event.type === "payment_intent.payment_failed") {
            const pi = event.data.object as Stripe.PaymentIntent;
            await this.prisma.payment.updateMany({
                where: { stripePaymentId: pi.id },
                data: { status: "failed" },
            });

            const orderId = pi.metadata?.orderId;
            if (orderId) {
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: { status: OrderStatus.PAYMENT_FAILED },
                });
            }
        }
        return { received: true };
    }
}
