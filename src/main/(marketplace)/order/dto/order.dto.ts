// import { ApiProperty } from "@nestjs/swagger";
// import { OrderStatus } from "@prisma/client";
// import { IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";

// export class CreateOrderDto {
//     @ApiProperty({
//         example: "3543c671-a22e-415d-9a0e-2c1c51a27d32",
//         description: "Unique identifier of the buyer (UUID)",
//         type: String,
//         format: "uuid",
//     })
//     @IsUUID()
//     @IsString()
//     @IsNotEmpty()
//     buyerId: string;

//     @ApiProperty({
//         example: "3543c671-a22e-415d-9a0e-2c1c51a27d32",
//         description: "Unique identifier of the product (UUID)",
//         type: String,
//         format: "uuid",
//     })
//     @IsUUID()
//     @IsString()
//     @IsNotEmpty()
//     productId: string;

//     @ApiProperty({
//         example: 'PENDING',
//         description: 'Current status of the order',
//         enum: OrderStatus,
//         enumName: 'OrderStatus',
//     })
//     @IsEnum(OrderStatus, { message: 'Status must be one of: PENDING, PAID, DELIVERED, CANCELLED' })
//     status?: OrderStatus;
// }

// export class UpdatedOrderDto {

// }

