import { mediaType, PostForm, postFrom, postVisibility, PostVisibility } from "@constants/enums";
import {
    CreatePostMetadata,
    CreatePostMetadataDto,
} from "@module/(posts)/post-metadata/dto/post.metadata.dto";
import { ApiHideProperty, ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import { MediaType } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from "class-validator";

export class CreatePost {
    @ApiHideProperty()
    @IsUUID()
    @IsOptional()
    authorId?: string;

    @ApiProperty({ example: "This is my first post!", required: false })
    @IsOptional()
    @IsString()
    text?: string;

    @ApiHideProperty()
    @IsOptional()
    @IsArray()
    mediaUrls?: string[];

    @ApiProperty({
        enum: mediaType,
        example: "IMAGE",
        required: false,
    })
    @IsOptional()
    @IsEnum(mediaType)
    mediaType?: MediaType;

    @ApiProperty({
        enum: postVisibility,
        example: "PUBLIC",
        required: false,
    })
    @IsOptional()
    @IsEnum(postVisibility)
    visibility?: PostVisibility;

    @ApiProperty({
        example: ["9e7a2c12-f0f2-4d6b-b042-123456789abc"],
        description: "Tagged user IDs (array or JSON string)",
        required: false,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (!value) return undefined;
        try {
            return typeof value === "string" ? JSON.parse(value) : value;
        } catch {
            return Array.isArray(value) ? value : [];
        }
    })
    @IsArray()
    @IsUUID("all", { each: true })
    taggedUserIds?: string[];

    @ApiProperty({
        type: CreatePostMetadataDto,
        description: "Metadata JSON",
        required: false,
    })
    @IsOptional()
    @ValidateNested()
    @Transform(({ value }) => {
        if (!value || value === "null" || value === "undefined") return undefined;
        try {
            return typeof value === "string" ? JSON.parse(value) : value;
        } catch {
            return undefined;
        }
    })
    @Type(() => CreatePostMetadata)
    metadata?: CreatePostMetadata;

    @ApiHideProperty()
    @IsOptional()
    @IsUUID()
    metadataId?: string;

    @ApiProperty({
        enum: postFrom,
        example: "REGULAR_PROFILE",
        required: true,
    })
    @IsEnum(postFrom)
    postFrom!: PostForm;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    @Transform(({ value }) => {
        return value ? value : undefined;
    })
    categoryId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    @Transform(({ value }) => {
        return value ? value : undefined;
    })
    communityId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    @Transform(({ value }) => {
        return value ? value : undefined;
    })
    ngoId?: string;

    @ApiProperty({
        example: false,
        description: "Accept volunteer option (boolean or string)",
        required: false,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === undefined || value === null) return undefined;
        if (typeof value === "boolean") return value;
        if (typeof value === "string") return value.toLowerCase() === "true" || value === "1";
        return Boolean(value);
    })
    @IsBoolean()
    acceptVolunteer?: boolean;

    @ApiProperty({
        example: false,
        description: "Accept donation option (boolean or string)",
        required: false,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === undefined || value === null) return undefined;
        if (typeof value === "boolean") return value;
        if (typeof value === "string") return value.toLowerCase() === "true" || value === "1";
        return Boolean(value);
    })
    @IsBoolean()
    acceptDonation?: boolean;
}

export class CreatePostDto extends IntersectionType(CreatePost) {}
export class UpdatePostDto extends PartialType(CreatePost) {}
