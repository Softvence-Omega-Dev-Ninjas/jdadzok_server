import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { PaymentMethodsService } from "./payment-method.service";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";
import { GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { VerifiedUser } from "@type/shared.types";
import { ApiBearerAuth } from "@nestjs/swagger";
import { handleRequest } from "@common/utils/handle.request.util";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("payment-methods")
export class PaymentMethodsController {
    constructor(private readonly paymentMethodsService: PaymentMethodsService) {}
    @Post("addStripe")
    async addStripeMethod(
        @GetVerifiedUser() user: VerifiedUser,
        @Body() dto: CreatePaymentMethodDto,
    ) {
        return handleRequest(
            () => this.paymentMethodsService.addStripeMethod(user.id, dto),
            "Payment Method added successfully",
        );
    }
}
