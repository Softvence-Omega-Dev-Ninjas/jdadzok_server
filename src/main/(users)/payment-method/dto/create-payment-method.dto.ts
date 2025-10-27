import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePaymentMethodDto {
    @ApiProperty({
        description: "Full name of the card holder",
        example: "John Henry",
    })
    @IsNotEmpty()
    @IsString()
    cardHolder: string;

    @ApiProperty({
        description: "Credit or debit card number",
        example: "4242424242424242",
    })
    @IsNotEmpty()
    @IsString()
    cardNumber: string;

    @ApiProperty({
        description: "Card expiration month (e.g., JAN, FEB, MAR)",
        example: "JUL",
    })
    @IsNotEmpty()
    @IsString()
    expireMonth: string;

    @ApiProperty({
        description: "Card expiration year (last two digits)",
        example: "26",
    })
    @IsNotEmpty()
    @IsString()
    expireYear: string;

    @ApiProperty({
        description: "3-digit security code (CVC/CVV)",
        example: "123",
    })
    @IsNotEmpty()
    @IsString()
    CVC: string;

    @ApiProperty({
        description: "Set this payment method as default (optional)",
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
