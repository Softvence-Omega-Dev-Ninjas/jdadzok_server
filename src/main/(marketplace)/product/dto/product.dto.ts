import { ApiProperty, PartialType } from "@nestjs/swagger";
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
} from "class-validator";

export class CreateProductDto {
    @ApiProperty({
        example: "3543c671-a22e-415d-9a0e-2c1c51a27d32",
        description: "Category ID",
        required: false,
    })
    @IsUUID()
    categoryId: string;

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

    @ApiProperty({ example: true, description: "Is product visible" })
    @IsOptional()
    @IsBoolean()
    isVisible?: boolean;

    @ApiProperty({ example: 10, description: "Available stock quantity" })
    @IsNotEmpty()
    @IsNumber()
    availability: number;

    @ApiProperty({
        example: "Dhaka, Bangladesh",
        description: "Product location",
    })
    @IsNotEmpty()
    @IsString()
    location: string;
}

// export class updateProductDto {
//   @ApiProperty({
//     example: "3543c671-a22e-415d-9a0e-2c1c51a27d32",
//     description: "Unique identifier of the seller (UUID)",
//     type: String,
//     format: "uuid",
//   })
//   @IsUUID()
//   @IsNotEmpty()
//   @IsOptional()
//   sellerId: string;

//   @ApiProperty({
//     example: "Wireless Bluetooth Headphones",
//     description: "Title of the product",
//     type: String,
//   })
//   @IsString()
//   @IsNotEmpty()
//   @IsOptional()
//   title: string;

//   @ApiProperty({
//     example: "High-quality wireless headphones with noise cancellation",
//     description: "Detailed description of the product",
//     type: String,
//   })
//   @IsString()
//   @IsNotEmpty()
//   @IsOptional()
//   description: string;

//   @ApiProperty({
//     example: 199.99,
//     description: "Price of the product",
//     type: Number,
//   })
//   @IsNumber()
//   @IsOptional()
//   price: number;

//   @ApiProperty({
//     example: "https://example.com/product-image.png",
//     description: "Digital file or product image URL",
//     type: String,
//     required: false,
//   })
//   @IsOptional()
//   @IsUrl()
//   digitalFileUrl?: string;

//   @ApiProperty({
//     example: "category-uuid",
//     description: "Category ID",
//     required: false,
//   })
//   @IsOptional()
//   @IsUUID()
//   categoryId?: string;

//   @ApiProperty({ example: true, description: "Is product visible" })
//   @IsOptional()
//   @IsBoolean()
//   isVisible?: boolean;

//   @ApiProperty({ example: 10, description: "Available stock quantity" })
//   @Optional()
//   @IsNotEmpty()
//   @IsNumber()
//   availability: number;

//   @ApiProperty({
//     example: "Dhaka, Bangladesh",
//     description: "Product location",
//   })
//   @IsOptional()
//   @IsNotEmpty()
//   @IsString()
//   location: string;
// }

export class updateProductDto extends PartialType(CreateProductDto) {
    @ApiProperty({
        example: "Updated Wireless Bluetooth Headphones",
        description: "Title of the product (required for update)",
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    title: string;
}
