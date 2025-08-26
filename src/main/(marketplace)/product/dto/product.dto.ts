import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";

export class CreateProductDto {
    @ApiProperty({
        example: "3543c671-a22e-415d-9a0e-2c1c51a27d32",
        description: "Unique identifier of the seller (UUID)",
        type: String,
        format: "uuid",
    })
    @IsUUID()
    @IsNotEmpty()
    sellerId: string;

    @ApiProperty({
        example: "Wireless Bluetooth Headphones",
        description: "Title of the product",
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        example: "High-quality wireless headphones with noise cancellation",
        description: "Detailed description of the product",
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        example: 199.99,
        description: "Price of the product",
        type: Number,
    })
    @IsNumber()
    price: number;

    @ApiProperty({
        example: "https://example.com/product-image.png",
        description: "Digital file or product image URL",
        type: String,
        required: false,
    })
    @IsOptional()
    @IsUrl()
    digitalFileUrl?: string;
}


export class updateProductDto {
    @ApiProperty({
        example: "3543c671-a22e-415d-9a0e-2c1c51a27d32",
        description: "Unique identifier of the seller (UUID)",
        type: String,
        format: "uuid",
    })
    @IsUUID()
    @IsNotEmpty()
    @IsOptional()
    sellerId: string;

    @ApiProperty({
        example: "Wireless Bluetooth Headphones",
        description: "Title of the product",
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    title: string;

    @ApiProperty({
        example: "High-quality wireless headphones with noise cancellation",
        description: "Detailed description of the product",
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    description: string;

    @ApiProperty({
        example: 199.99,
        description: "Price of the product",
        type: Number,
    })
    @IsNumber()
    @IsOptional()
    price: number;

    @ApiProperty({
        example: "https://example.com/product-image.png",
        description: "Digital file or product image URL",
        type: String,
        required: false,
    })
    @IsOptional()
    @IsUrl()
    digitalFileUrl?: string;
}