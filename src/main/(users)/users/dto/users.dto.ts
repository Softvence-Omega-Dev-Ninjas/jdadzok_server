import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  PartialType,
} from "@nestjs/swagger";
import { AuthProvider, CapLevel, Role } from "@prisma/client";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

class UserCreate {
  @ApiProperty({ description: "User email address", example: "user@user.com" })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: "Password hash", example: "pass123" })
  @IsOptional()
  @IsString()
  @MinLength(6)
  passowrd?: string;

  @ApiPropertyOptional({
    enum: AuthProvider,
    description: "Authentication provider",
    example: AuthProvider.EMAIL,
  })
  @IsOptional()
  @IsEnum(AuthProvider)
  authProvider?: AuthProvider;

  @ApiHideProperty()
  @ApiPropertyOptional({
    enum: Role,
    description: "User role",
    example: Role.USER,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiHideProperty()
  @ApiPropertyOptional({
    enum: CapLevel,
    description: "User capability level",
    example: CapLevel.GREEN,
  })
  @IsOptional()
  @IsEnum(CapLevel)
  capLevel?: CapLevel;
}

class CreateUserProfile {
  @ApiPropertyOptional({ description: "Profile name", example: "John Doe" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Profile username", example: "johndoe" })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: "Profile bio", example: "I love coding" })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: "Profile avatar URL",
    example: "https://example.com/avatar.png",
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: "Profile location",
    example: "Dhaka, Bangladesh",
  })
  @IsOptional()
  @IsString()
  location?: string;
}

class UserUpdate {
  @ApiPropertyOptional({
    description: "User email address",
    example: "user@example.com",
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: "Password hash",
    example: "hashedpassword123",
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  passwordHash?: string;

  @ApiPropertyOptional({
    enum: AuthProvider,
    description: "Authentication provider",
    example: AuthProvider.EMAIL,
  })
  @IsOptional()
  @IsEnum(AuthProvider)
  authProvider?: AuthProvider;

  @ApiPropertyOptional({
    enum: Role,
    description: "User role",
    example: Role.USER,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    enum: CapLevel,
    description: "User capability level",
    example: CapLevel.GREEN,
  })
  @IsOptional()
  @IsEnum(CapLevel)
  capLevel?: CapLevel;
}

class UpdateProfile {
  @ApiPropertyOptional({ description: "Profile name", example: "John Doe" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Profile username", example: "johndoe" })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: "Profile bio", example: "I love coding" })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: "Profile avatar URL",
    example: "https://example.com/avatar.png",
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: "Profile location",
    example: "Dhaka, Bangladesh",
  })
  @IsOptional()
  @IsString()
  location?: string;
}

export class CreateUserDto extends IntersectionType(UserCreate) { }
export class UpdateUserDto extends PartialType(IntersectionType(UserUpdate)) { }
export class CreateProfileDto extends IntersectionType(CreateUserProfile) { }
export class UpdateProfileDto extends PartialType(
  IntersectionType(UpdateProfile),
) { }
