import { Controller, Get, Headers, Param, Post, Req, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { PaymentsService } from "./payments.service";

@ApiTags("Payments")
@Controller("payments")
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    // stripe webhook raw body main.ts set raw body.
    @Post("webhook")
    async webhook(
        @Req() req: Request,
        @Headers("stripe-signature") sig: string,
        @Res() res: Response,
    ) {
        const rawBody: Buffer = req.body; // express.raw set in main.ts for this route

        const result = await this.paymentsService.handleStripeWebhook(rawBody, sig);
        return res.json(result);
    }

    //  fetch payment by order id
    @Get("order/:orderId")
    async getByOrder(@Param("orderId") orderId: string) {
        return this.paymentsService.getPaymentByOrder(orderId);
    }
}
