import { Body, Controller, Post, Req, Headers, UseGuards } from "@nestjs/common";
import { StripeService } from "./stripe.service";
import { Request } from "express";
import Stripe from "stripe";
import { GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { VerifiedUser } from "@type/shared.types";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";

@Controller("stripe")
export class StripeController {
    constructor(private readonly stripeService: StripeService) {}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post("create-account")
    createAccount(@GetVerifiedUser() user: VerifiedUser) {
        return this.stripeService.createExpressAccount(user.id);
    }

    @Post("create-payment-intent")
    createPayment(@Body("orderId") orderId: string) {
        return this.stripeService.createPaymentIntent(orderId);
    }

    @Post("payout")
    payout(@Body("sellerId") sellerId: string, @Body("amount") amount: number) {
        return this.stripeService.handlePayout(sellerId, amount);
    }

    @Post("webhook")
    async stripeWebhook(@Req() req: Request, @Headers("stripe-signature") signature: string) {
        const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: "2025-10-29.clover" });

        const event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!,
        );

        return this.stripeService.handleWebhook(event);
    }
}
