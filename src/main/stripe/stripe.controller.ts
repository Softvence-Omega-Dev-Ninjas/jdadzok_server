import { GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { Body, Controller, Get, Headers, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { VerifiedUser } from "@type/shared.types";
import { Request } from "express";
import { StripeService } from "./stripe.service";
import { CreatePayoutDto } from "./dto/create-payout.dto";

@Controller("stripe")
export class StripeController {
    constructor(private readonly stripeService: StripeService) {}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post("create-account")
    createAccount(@GetVerifiedUser() user: VerifiedUser) {
        return this.stripeService.createExpressAccount(user.id);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("account")
    getAccount(@GetVerifiedUser() user: VerifiedUser) {
        return this.stripeService.getExpressAccount(user.id);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post("payout")
    payout(@GetVerifiedUser() user: VerifiedUser, @Body() dto: CreatePayoutDto) {
        console.log(user.id, dto);
        return this.stripeService.handlePayout(user.id, dto);
    }

    @Post("webhook")
    async stripeWebhook(@Req() req: Request, @Headers("stripe-signature") signature: string) {
        return this.stripeService.handleWebhook(req, signature);
    }
}
