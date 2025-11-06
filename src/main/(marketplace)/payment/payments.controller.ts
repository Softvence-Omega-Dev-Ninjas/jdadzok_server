import { Controller, Post, Req, Headers, Res, Get, Param } from "@nestjs/common";
import { Response } from "express";
import { ApiTags } from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";

@ApiTags("Payments")
@Controller("payments")
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    // stripe webhook raw body main.ts set raw body.
    @Post("webhook")
    async webhook(@Req() req: any, @Headers("stripe-signature") sig: string, @Res() res: Response) {
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!endpointSecret) {
            throw new Error("Missing STRIPE_WEBHOOK_SECRET env var");
        }

        const rawBody: Buffer = req.body;
        try {
            const result = await this.paymentsService.handleStripeWebhook(
                rawBody,
                sig,
                endpointSecret,
            );
            return res.json(result);
        } catch (err) {
            return res.status(400).json({ error: err.message || "Webhook error" });
        }
    }

    //  fetch payment by order id
    @Get("order/:orderId")
    async getByOrder(@Param("orderId") orderId: string) {
        return this.paymentsService.getPaymentByOrder(orderId);
    }
}
