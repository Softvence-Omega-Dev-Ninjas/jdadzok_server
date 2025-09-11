import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PartialType,
} from "@nestjs/swagger";
import { PaymentMethod } from "@prisma/client";
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from "class-validator";

class PaymentMethodDto {
  @ApiProperty({ enum: PaymentMethod, description: "Payment method type" })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ description: "Card holder name" })
  @IsString()
  @Length(2, 100)
  cardHolder: string;

  @ApiProperty({ description: "Card number (encrypted/tokenized)" })
  @IsString()
  @Length(13, 19)
  cardNumber: string;

  @ApiProperty({ description: "Expiration month (MM)" })
  @IsString()
  @Length(2, 2)
  expireMonth: string;

  @ApiProperty({ description: "Expiration year (YYYY)" })
  @IsString()
  @Length(4, 4)
  expireYear: string;

  @ApiProperty({ description: "Card verification code" })
  @IsString()
  @Length(3, 4)
  CVC: string;

  @ApiProperty({
    description: "Whether this is the default payment method",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CreatePaymentMethodDto extends IntersectionType(
  PaymentMethodDto,
) {}

export class UpdatePaymentMethodDto extends PartialType(
  IntersectionType(PaymentMethodDto),
) {}

export class PaymentMethodQueryDto {
  @ApiProperty({
    description: "User ID to filter payment methods",
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    enum: PaymentMethod,
    description: "Payment method type to filter",
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiProperty({
    description: "Filter by default payment methods only",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class PaymentMethodResponseDto extends OmitType(PaymentMethodDto, [
  "CVC",
] as const) {
  @ApiProperty({ description: "Payment method ID" })
  id: string;

  @ApiProperty({ description: "User ID who owns this payment method" })
  userId: string;

  @ApiProperty({ description: "Masked card number for display" })
  maskedCardNumber: string;

  @ApiProperty({ description: "Creation timestamp" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  updatedAt: Date;
}
