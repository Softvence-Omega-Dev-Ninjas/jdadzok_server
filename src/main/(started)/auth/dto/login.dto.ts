import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

class Login {
  @ApiProperty({ description: "User email address", example: "user@user.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "Password hash", example: "pass123" })
  @IsOptional()
  @IsString()
  @MinLength(6)
  passwordHash?: string;
}

export class LoginDto extends IntersectionType(Login) {}
