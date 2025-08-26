import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsStrongPassword } from "class-validator";

class ResetPassword {
  @ApiProperty({
    example: "user@example.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 123456,
  })
  @IsNumber()
  token: number;

  @ApiProperty({
    example: "pass123",
  })
  @IsStrongPassword()
  password: string;
}

export class ResetPasswordDto extends IntersectionType(ResetPassword) {}
