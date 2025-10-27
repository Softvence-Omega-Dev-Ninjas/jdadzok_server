import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { Controller, Post, Body, UseGuards, Get, Delete } from "@nestjs/common";
import { PaymentMethodsService } from "./payment-method.service";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";
import { GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { VerifiedUser } from "@type/shared.types";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { handleRequest } from "@common/utils/handle.request.util";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("payment-methods")
export class PaymentMethodsController {
    constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

    // added user payment data
    @Post("addStripe")
    @ApiOperation({ summary: "Add Stripe payment method (only one allowed per user)" })
    async addStripeMethod(
        @GetVerifiedUser() user: VerifiedUser,
        @Body() dto: CreatePaymentMethodDto,
    ) {
        return handleRequest(
            () => this.paymentMethodsService.addStripeMethod(user.id, dto),
            "Payment Method added successfully",
        );
    }

    // get user payment method data
    @Get("me")
    @ApiOperation({ summary: "Get logged-in user’s payment method" })
    @ApiResponse({ status: 200, description: "Returns the user’s payment method." })
    @ApiResponse({ status: 404, description: "No payment method found." })
    async getMyPaymentMethod(@GetVerifiedUser() user: VerifiedUser) {
        return handleRequest(
            () => this.paymentMethodsService.getMyPaymentMethod(user.id),
            "Payment Method get successfully",
        );
    }

    // delete payment method.
    @Delete("me")
    @ApiResponse({ status: 200, description: "Payment method deleted successfully." })
    @ApiResponse({ status: 404, description: "No payment method found to delete." })
    @ApiOperation({ summary: "Delete logged-in user’s payment method" })
    async deleteMyPaymentMethod(@GetVerifiedUser() user: VerifiedUser) {
        return handleRequest(
            () => this.paymentMethodsService.deleteMyPaymentMethod(user.id),
            "Payment Method delete successfully",
        );
    }
}
