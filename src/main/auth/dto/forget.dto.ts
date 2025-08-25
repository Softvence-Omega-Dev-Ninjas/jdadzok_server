import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

class ForgetPassword {
    @ApiProperty({
        example: "user@example.com"
    })
    @IsEmail()
    email: string
}
export class ForgetPasswordDto extends IntersectionType(ForgetPassword) { }