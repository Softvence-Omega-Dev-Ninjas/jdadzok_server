// src/admin/dto/custom-notification.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CustomNotificationDto {
    @ApiProperty({ description: "Title of the custom notification" })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: "Message body of the custom notification" })
    @IsString()
    @IsNotEmpty()
    message: string;
}
