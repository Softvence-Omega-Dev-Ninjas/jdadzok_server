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
import { UpdateUserProfileMetricsDto } from "../../profile-metrics/dto/user.profile.metrics";
import { UpdateUserProfileDto } from "../../user-profile/dto/user.profile.dto";

class UserCreate {
  @ApiProperty({ description: "User email address", example: "user@user.com" })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: "Password hash", example: "pass123" })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

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

class SelectUser {
  @ApiPropertyOptional({
    type: UpdateUserProfileDto,
  })
  profile?: UpdateUserProfileDto;
  @ApiPropertyOptional({
    type: UpdateUserProfileMetricsDto,
  })
  metrics?: UpdateUserProfileMetricsDto;
}

export class CreateUserDto extends IntersectionType(UserCreate) { }
export class UpdateUserDto extends IntersectionType(PartialType(UserCreate)) { }
export class SelectUserDto extends IntersectionType(
  PartialType(CreateUserDto),
  PartialType(SelectUser),
) { }
