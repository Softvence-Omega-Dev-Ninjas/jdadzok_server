import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, Validate } from "class-validator";
import { parseCustomDate } from "./parse-custom-date";

class CustomDateValidator {
    validate(value: string) {
        return !!parseCustomDate(value); // returns true if valid
    }
    defaultMessage() {
        return "scheduleTime must be in format DD-MM-h.mm AM/PM";
    }
}

export class CustomNotificationDto {
    @ApiProperty({ example: "Custom Notification Title", description: "Title of the notification" })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: "This is a custom notification.", description: "Message body" })
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiProperty({
        required: false,
        example: "21-11-3.40 AM",
        description: "Schedule time in format DD-MM-h.mm AM/PM",
    })
    @IsOptional()
    @IsString()
    @Validate(CustomDateValidator)
    scheduleTime?: string;
}
