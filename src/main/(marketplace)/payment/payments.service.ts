import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { PrismaService } from "src/lib/prisma/prisma.service";
import Stripe from "stripe";

@Injectable()
export class PaymentsService {
    private stripe: Stripe;
    private webHookSecret: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) {
        const secret = this.config.get<string>("STRIPE_SECRET");
        if (!secret) throw new Error("Missing STRIPE_SECRET in .env file");

        this.stripe = new Stripe(secret);
        this.webHookSecret = this.config.getOrThrow("STRIPE_WEBHOOK_SECRET");
    }

    // create stripe paymentIntent for an order and save payment record in DB

    async createPaymentIntentForOrder(orderId: string, amount: number, currency = "usd") {
        // amount must be in cents
        const stripeIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            metadata: { orderId },
        });

        // save payment record in prisma
        const payment = await this.prisma.payment.create({
            data: {
                orderId,
                stripePaymentId: stripeIntent.id,
                amount,
                currency,
                status: PaymentStatus.pending,
            },
        });

        return {
            clientSecret: stripeIntent.client_secret,
            paymentId: payment.id,
            paymentIntentId: stripeIntent.id,
        };
    }

    // get payment details for an order
    async getPaymentByOrder(orderId: string) {
        return this.prisma.payment.findFirst({
            where: { orderId },
            include: { order: true },
        });
    }

    // stripe Webhook — verifies signature and updates DB
    async handleStripeWebhook(rawBody: Buffer, sig: string) {
        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(rawBody, sig, this.webHookSecret);
        } catch (err: any) {
            // throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
            console.error(err);
            return { received: false };
        }
        console.log("Event In Webhook", event);

        switch (event.type) {
            // Payment succeeded
            case "payment_intent.succeeded": {
                const intent = event.data.object as Stripe.PaymentIntent;
                const orderId = intent.metadata?.orderId;

                await this.prisma.payment.updateMany({
                    where: { stripePaymentId: intent.id },
                    data: { status: PaymentStatus.succeeded },
                });

                if (orderId) {
                    await this.prisma.order.update({
                        where: { id: orderId },
                        data: { status: OrderStatus.PAID },
                    });
                }

                break;
            }

            //  Payment failed
            case "payment_intent.payment_failed": {
                const intent = event.data.object as Stripe.PaymentIntent;
                const orderId = intent.metadata?.orderId;

                await this.prisma.payment.updateMany({
                    where: { stripePaymentId: intent.id },
                    data: { status: PaymentStatus.failed },
                });

                if (orderId) {
                    await this.prisma.order.update({
                        where: { id: orderId },
                        data: { status: OrderStatus.PAYMENT_FAILED },
                    });
                }

                break;
            }

            default:
                console.log(`Unhandled Stripe event type: ${event.type}`);
        }

        return { received: true };
    }
}
