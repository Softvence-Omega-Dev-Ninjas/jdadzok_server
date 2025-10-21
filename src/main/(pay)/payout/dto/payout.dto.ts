import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import { PaymentMethod, PayOutStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

class PayoutDto {
    @ApiProperty({ description: "Amount to pay out", minimum: 0.01 })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: "Amount must have at most 2 decimal places" })
    @Min(0.01, { message: "Amount must be greater than 0" })
    @Type(() => Number)
    amount: number;

    @ApiProperty({
        enum: PaymentMethod,
        description: "Payment method for payout",
    })
    @IsEnum(PaymentMethod)
    method: PaymentMethod;
}

export class CreatePayoutDto extends IntersectionType(PayoutDto) {
    @ApiProperty({ description: "User ID receiving the payout", required: false })
    @IsOptional()
    @IsString()
    @IsUUID(4, { message: "User ID must be a valid UUID" })
    userId?: string; // Optional if creating for the authenticated user
}

export class UpdatePayoutDto extends PartialType(PayoutDto) {
    @ApiProperty({
        enum: PayOutStatus,
        description: "Payout status",
        required: false,
    })
    @IsOptional()
    @IsEnum(PayOutStatus)
    status?: PayOutStatus;

    @ApiProperty({ description: "External transaction ID", required: false })
    @IsOptional()
    @IsString()
    transactionId?: string;

    @ApiProperty({ description: "Processor fee", minimum: 0, required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Type(() => Number)
    processorFee?: number;
}

export class PayoutQueryDto {
    @ApiProperty({ description: "User ID to filter payouts", required: false })
    @IsOptional()
    @IsString()
    @IsUUID(4)
    userId?: string;

    @ApiProperty({
        enum: PayOutStatus,
        description: "Payout status to filter",
        required: false,
    })
    @IsOptional()
    @IsEnum(PayOutStatus)
    status?: PayOutStatus;

    @ApiProperty({
        enum: PaymentMethod,
        description: "Payment method to filter",
        required: false,
    })
    @IsOptional()
    @IsEnum(PaymentMethod)
    method?: PaymentMethod;

    @ApiProperty({
        description: "Minimum amount filter",
        minimum: 0,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    minAmount?: number;

    @ApiProperty({
        description: "Maximum amount filter",
        minimum: 0,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    maxAmount?: number;

    @ApiProperty({
        description: "Start date for filtering (ISO string)",
        required: false,
    })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiProperty({
        description: "End date for filtering (ISO string)",
        required: false,
    })
    @IsOptional()
    @IsString()
    endDate?: string;

    @ApiProperty({
        description: "Limit number of results",
        minimum: 1,
        maximum: 100,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    limit?: number;

    @ApiProperty({
        description: "Offset for pagination",
        minimum: 0,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    offset?: number;
}

export class PayoutResponseDto extends PayoutDto {
    @ApiProperty({ description: "Payout ID" })
    id: string;

    @ApiProperty({ description: "User ID receiving the payout" })
    userId: string;

    @ApiProperty({ enum: PayOutStatus, description: "Current payout status" })
    status: PayOutStatus;

    @ApiProperty({ description: "External transaction ID", nullable: true })
    transactionId: string | null;

    @ApiProperty({ description: "Processor fee", nullable: true })
    processorFee: number | null;

    @ApiProperty({ description: "Net amount after fees" })
    netAmount: number;

    @ApiProperty({ description: "Creation timestamp" })
    createdAt: Date;

    @ApiProperty({ description: "Last update timestamp" })
    updatedAt: Date;
}

export class PayoutStatsDto {
    @ApiProperty({ description: "Total amount paid out" })
    totalAmount: number;

    @ApiProperty({ description: "Total number of payouts" })
    totalCount: number;

    @ApiProperty({ description: "Pending amount" })
    pendingAmount: number;

    @ApiProperty({ description: "Number of pending payouts" })
    pendingCount: number;

    @ApiProperty({ description: "Paid amount" })
    paidAmount: number;

    @ApiProperty({ description: "Number of paid payouts" })
    paidCount: number;

    @ApiProperty({ description: "Total fees paid" })
    totalFees: number;
}

export class ProcessPayoutDto {
    @ApiProperty({
        description: "External transaction ID from payment processor",
    })
    @IsString()
    transactionId: string;

    @ApiProperty({ description: "Fee charged by payment processor", minimum: 0 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Type(() => Number)
    processorFee: number;
}
