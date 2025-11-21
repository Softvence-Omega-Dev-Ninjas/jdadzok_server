import { GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { VerifiedUser } from "@type/shared.types";
import { CreatePayoutDto } from "./dto/create-payout.dto";
import { StripeService } from "./stripe.service";

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
        return this.stripeService.handlePayout(user.id, dto);
    }

    @Post("webhook")
    @HttpCode(HttpStatus.OK)
    async handleWebhook(
        @Headers("stripe-signature") signature: string,
        @Body() body: Buffer, // raw body for Stripe verification
    ) {
        try {
            this.stripeService.handleWebhook(body, signature);
            return { received: true };
        } catch (error) {
            return { received: false, error: error.message };
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("payouts")
    getAllPayouts(@GetVerifiedUser() user: VerifiedUser) {
        return this.stripeService.getAllPayouts(user.id);
    }
}
