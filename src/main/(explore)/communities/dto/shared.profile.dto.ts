import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateSharedProfileDto {
    @ApiProperty({ description: 'Title of the community', example: 'Software Engineer' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Biography of the community', example: 'Passionate developer and tech enthusiast.' })
    @IsString()
    bio: string;

    @ApiProperty({ description: 'Avatar URL', example: 'https://example.com/avatar.jpg', required: false })
    @IsOptional()
    @IsUrl()
    avatarUrl?: string;

    @ApiProperty({ description: 'Cover image URL', example: 'https://example.com/cover.jpg', required: false })
    @IsOptional()
    @IsUrl()
    coverUrl?: string;

    @ApiProperty({ description: 'Location of the user', example: 'New York, USA', required: false })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ description: 'Number of followers', example: 0 })
    @IsInt()
    followersCount: number;

    @ApiProperty({ description: 'Number of following', example: 0 })
    @IsInt()
    followingCount: number;

    @ApiProperty({ description: 'Field of work', example: 'Software Development' })
    @IsString()
    fieldOfWork: string;

    @ApiProperty({ description: 'About section', example: 'Loves coding and contributing to open source projects.' })
    @IsString()
    About: string;
}