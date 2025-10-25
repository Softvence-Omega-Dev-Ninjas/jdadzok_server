import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class NotificationToggleDto {
    @ApiPropertyOptional({
        description: "Receive email notifications",
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    email?: boolean = false;

    @ApiPropertyOptional({
        description: "Receive communication notifications",
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    communication?: boolean = false;

    @ApiPropertyOptional({
        description: "Receive community",
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    community?: boolean = false;

    @ApiPropertyOptional({
        description: "Receive tasks and projects notifications",
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    comment?: boolean = false;

    @ApiPropertyOptional({
        description: "Receive post notifications",
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    post?: boolean = false;

    @ApiPropertyOptional({
        description: "Receive message notifications",
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    message?: boolean = false;

    @ApiPropertyOptional({
        description: "Receive user registration notifications",
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    userRegistration?: boolean = false;
}
