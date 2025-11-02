import { GetUser } from "@common/jwt/jwt.decorator";
import { successResponse } from "@common/utils/response.util";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { TUser } from "@type/index";
import {
    CreateGlobalPaymentMethodDto,
    PaymentMethodQueryDto,
    PaymentMethodResponseDto,
    UpdatePaymentMethodDto,
} from "./dto/payment-method.dto";
import { PaymentMethodService } from "./payment-method.service";

@ApiTags("Payment Methods")
@ApiBearerAuth()
@Controller("payment-methods")
@UseGuards(JwtAuthGuard)
export class PaymentMethodController {
    constructor(private readonly paymentMethodService: PaymentMethodService) {}

    @Post()
    @ApiOperation({ summary: "Create a new payment method" })
    @ApiResponse({
        status: 201,
        description: "Payment method created successfully",
        type: PaymentMethodResponseDto,
    })
    @ApiResponse({ status: 400, description: "Bad request" })
    @ApiResponse({ status: 409, description: "Payment method already exists" })
    async createPaymentMethod(
        @GetUser() user: TUser,
        @Body() createDto: CreateGlobalPaymentMethodDto,
    ) {
        try {
            const pm = await this.paymentMethodService.createPaymentMethod(user.userId, createDto);
            return successResponse(pm, "Payment method created successfully");
        } catch (err) {
            return err;
        }
    }

    @Get()
    @ApiOperation({ summary: "Get all payment methods for the current user" })
    @ApiResponse({
        status: 200,
        description: "Payment methods retrieved successfully",
        type: [PaymentMethodResponseDto],
    })
    async getUserPaymentMethods(@GetUser() user: TUser): Promise<PaymentMethodResponseDto[]> {
        return this.paymentMethodService.findUserPaymentMethods(user.userId);
    }

    @Get("all")
    @ApiOperation({
        summary: "Get all payment methods with query filters (admin only)",
    })
    @ApiQuery({ type: PaymentMethodQueryDto, required: false })
    @ApiResponse({
        status: 200,
        description: "Payment methods retrieved successfully",
        type: [PaymentMethodResponseDto],
    })
    async getAllPaymentMethods(
        @Query() query: PaymentMethodQueryDto,
    ): Promise<PaymentMethodResponseDto[]> {
        return this.paymentMethodService.findPaymentMethods(query);
    }

    @Get("default")
    @ApiOperation({
        summary: "Get the default payment method for the current user",
    })
    @ApiResponse({
        status: 200,
        description: "Default payment method retrieved successfully",
        type: PaymentMethodResponseDto,
    })
    @ApiResponse({ status: 404, description: "No default payment method found" })
    async getDefaultPaymentMethod(
        @GetUser() user: TUser,
    ): Promise<PaymentMethodResponseDto | null> {
        return this.paymentMethodService.findDefaultPaymentMethod(user.userId);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a payment method by ID" })
    @ApiParam({ name: "id", description: "Payment method ID" })
    @ApiResponse({
        status: 200,
        description: "Payment method retrieved successfully",
        type: PaymentMethodResponseDto,
    })
    @ApiResponse({ status: 404, description: "Payment method not found" })
    async getPaymentMethodById(
        @GetUser() user: TUser,
        @Param("id") id: string,
    ): Promise<PaymentMethodResponseDto> {
        return this.paymentMethodService.findPaymentMethodById(id, user.userId);
    }

    @Put(":id")
    @ApiOperation({ summary: "Update a payment method" })
    @ApiParam({ name: "id", description: "Payment method ID" })
    @ApiResponse({
        status: 200,
        description: "Payment method updated successfully",
        type: PaymentMethodResponseDto,
    })
    @ApiResponse({ status: 404, description: "Payment method not found" })
    @ApiResponse({ status: 400, description: "Bad request" })
    async updatePaymentMethod(
        @GetUser() user: TUser,
        @Param("id") id: string,
        @Body() updateDto: UpdatePaymentMethodDto,
    ): Promise<PaymentMethodResponseDto> {
        return this.paymentMethodService.updatePaymentMethod(id, user.userId, updateDto);
    }

    @Put(":id/set-default")
    @ApiOperation({ summary: "Set a payment method as default" })
    @ApiParam({ name: "id", description: "Payment method ID" })
    @ApiResponse({
        status: 200,
        description: "Payment method set as default successfully",
        type: PaymentMethodResponseDto,
    })
    @ApiResponse({ status: 404, description: "Payment method not found" })
    @HttpCode(HttpStatus.OK)
    async setAsDefault(
        @GetUser() user: TUser,
        @Param("id") id: string,
    ): Promise<PaymentMethodResponseDto> {
        return this.paymentMethodService.setAsDefault(id, user.userId);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Delete a payment method" })
    @ApiParam({ name: "id", description: "Payment method ID" })
    @ApiResponse({
        status: 204,
        description: "Payment method deleted successfully",
    })
    @ApiResponse({ status: 404, description: "Payment method not found" })
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePaymentMethod(@GetUser() user: TUser, @Param("id") id: string): Promise<void> {
        return this.paymentMethodService.deletePaymentMethod(id, user.userId);
    }

    @Get(":id/validate-ownership")
    @ApiOperation({ summary: "Validate payment method ownership" })
    @ApiParam({ name: "id", description: "Payment method ID" })
    @ApiResponse({
        status: 200,
        description: "Ownership validation result",
        schema: { type: "object", properties: { isOwner: { type: "boolean" } } },
    })
    async validateOwnership(
        @GetUser() user: TUser,
        @Param("id") id: string,
    ): Promise<{ isOwner: boolean }> {
        const isOwner = await this.paymentMethodService.validatePaymentMethodOwnership(
            id,
            user.userId,
        );
        return { isOwner };
    }
}
