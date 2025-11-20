// src/admin/dto/custom-notification.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CustomNotificationDto {
    @ApiProperty({ description: "Title of the custom notification" })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: "Message body of the custom notification" })
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiProperty({
        required: false,
        description: "Schedule time (ISO date string). Example: 2025-11-21T14:30:00Z"
    })
    @IsOptional()
    @IsDateString()
    scheduleTime?: string;
}
