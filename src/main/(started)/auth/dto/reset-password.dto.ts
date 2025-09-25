import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { IsStrongPassword, IsUUID } from "class-validator";

class ResetPassword {
    @ApiProperty({
        example: "user_uuid",
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        example: "pass123",
    })
    @IsStrongPassword()
    password: string;
}

export class ResetPasswordDto extends IntersectionType(ResetPassword) {}
