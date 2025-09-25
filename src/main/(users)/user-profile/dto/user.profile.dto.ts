import { ApiPropertyOptional, IntersectionType, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl } from "class-validator";

class UserProfile {
    @ApiPropertyOptional({
        description: "Full name of the user",
        example: "John Doe",
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: "Unique username", example: "johndoe" })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiPropertyOptional({
        description: "Professional title",
        example: "Software Engineer",
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({
        description: "User bio or description",
        example: "Loves TypeScript and NestJS",
    })
    @IsOptional()
    @IsString()
    bio?: string;

    @ApiPropertyOptional({
        description: "URL to avatar image",
        example: "https://example.com/avatar.png",
    })
    @IsOptional()
    @IsUrl()
    avatarUrl?: string;

    @ApiPropertyOptional({
        description: "URL to cover photo",
        example: "https://example.com/cover.jpg",
    })
    @IsOptional()
    @IsUrl()
    coverUrl?: string;

    @ApiPropertyOptional({
        description: "User location",
        example: "New York, USA",
    })
    @IsOptional()
    @IsString()
    location?: string;
}

export class CreateUserProfileDto extends IntersectionType(UserProfile) {}
export class UpdateUserProfileDto extends PartialType(IntersectionType(UserProfile)) {}
