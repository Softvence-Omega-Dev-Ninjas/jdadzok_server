import { ApiProperty } from '@nestjs/swagger';
import { MediaType, mediaType, PostVisibility, postVisibility } from '@project/constants';
import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID
} from 'class-validator';

// -----------------------------------
// POST DTO
// -----------------------------------
export class CreatePostDto {
    @ApiProperty({
        example: "3543c671-a22e-415d-9a0e-2c1c51a27d32",
        description: "Unique identifier of the author",
        type: String,
        format: "uuid"
    })
    @IsUUID()
    author_id: string;

    @ApiProperty({
        example: "6b5a3c9f-68f1-4e5c-8e2b-61d8c58a7c11",
        description: "Optional category ID for the post",
        type: String,
        format: "uuid",
        required: false
    })
    @IsOptional()
    @IsUUID()
    category_id?: string;

    @ApiProperty({
        example: "This is my first post!",
        description: "Main text content of the post",
        type: String
    })
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty({
        example: "https://example.com/image.png",
        description: "Optional media URL attached to the post",
        type: String,
        required: false
    })
    @IsOptional()
    @IsUrl()
    media_url?: string;

    @ApiProperty({
        enum: mediaType,
        example: "IMAGE",
        description: "Type of media attached to the post",
        required: false
    })
    @IsOptional()
    @IsEnum(mediaType)
    media_type?: MediaType;

    @ApiProperty({
        enum: postVisibility,
        example: "PUBLIC",
        description: "Visibility of the post",
        required: false
    })
    @IsOptional()
    @IsEnum(postVisibility)
    visibility?: PostVisibility;

    @ApiProperty({
        example: "a3a87243-5a47-4d71-9e0b-f3d8925c2f21",
        description: "Optional metadata ID",
        type: String,
        format: "uuid",
        required: false
    })
    @IsOptional()
    @IsUUID()
    metadata_id?: string;
}

export class UpdatePostDto {
    @ApiProperty({
        example: "Updated post text",
        description: "Updated text content of the post",
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    text?: string;

    @ApiProperty({
        example: "https://example.com/updated-image.png",
        description: "Updated media URL",
        type: String,
        required: false
    })
    @IsOptional()
    @IsUrl()
    media_url?: string;

    @ApiProperty({
        enum: mediaType,
        example: "VIDEO",
        description: "Updated media type",
        required: false
    })
    @IsOptional()
    @IsEnum(mediaType)
    media_type?: MediaType;

    @ApiProperty({
        enum: postVisibility,
        example: "FOLLOWERS",
        description: "Updated post visibility",
        required: false
    })
    @IsOptional()
    @IsEnum(postVisibility)
    visibility?: PostVisibility;

    @ApiProperty({
        example: "b7c8d5b5-473d-4e12-a822-56a34ff9ab21",
        description: "Updated metadata ID",
        type: String,
        format: "uuid",
        required: false
    })
    @IsOptional()
    @IsUUID()
    metadata_id?: string;
}

// -----------------------------------
// COMMENT DTO
// -----------------------------------
export class CreateCommentDto {
    @ApiProperty({
        example: "82c6a3c7-5db4-4a5d-9b0e-123456789abc",
        description: "Post ID where the comment is made",
        type: String,
        format: "uuid"
    })
    @IsUUID()
    post_id: string;

    @ApiProperty({
        example: "b85f1c7e-2d36-4d5f-95d1-abcdef123456",
        description: "Optional parent comment ID (for replies)",
        type: String,
        format: "uuid",
        required: false
    })
    @IsOptional()
    @IsUUID()
    parent_comment_id?: string;

    @ApiProperty({
        example: "8f1b2c3d-4e5f-6789-abcd-1234567890ef",
        description: "Author ID of the comment",
        type: String,
        format: "uuid"
    })
    @IsUUID()
    author_id: string;

    @ApiProperty({
        example: "This is a comment",
        description: "Comment text",
        type: String
    })
    @IsString()
    @IsNotEmpty()
    text: string;
}

export class UpdateCommentDto {
    @ApiProperty({
        example: "Updated comment text",
        description: "Updated comment text",
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    text?: string;
}

// -----------------------------------
// LIKE DTO
// -----------------------------------
export class CreateLikeDto {
    @ApiProperty({
        example: "1111aaaa-2222-bbbb-3333-cccc4444dddd",
        description: "User ID who liked",
        type: String,
        format: "uuid"
    })
    @IsUUID()
    user_id: string;

    @ApiProperty({
        example: "post-uuid-here",
        description: "Optional post ID being liked",
        type: String,
        format: "uuid",
        required: false
    })
    @IsOptional()
    @IsUUID()
    post_id?: string;

    @ApiProperty({
        example: "comment-uuid-here",
        description: "Optional comment ID being liked",
        type: String,
        format: "uuid",
        required: false
    })
    @IsOptional()
    @IsUUID()
    comment_id?: string;
}

// -----------------------------------
// SHARE DTO
// -----------------------------------
export class CreateShareDto {
    @ApiProperty({
        example: "user-uuid-here",
        description: "User ID who shared",
        type: String,
        format: "uuid"
    })
    @IsUUID()
    user_id: string;

    @ApiProperty({
        example: "post-uuid-here",
        description: "Post ID being shared",
        type: String,
        format: "uuid"
    })
    @IsUUID()
    post_id: string;
}

