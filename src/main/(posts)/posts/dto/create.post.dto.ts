import {
  MediaType,
  mediaType,
  PostVisibility,
  postVisibility,
} from "@constants/enums";
import { CreatePostMetadataDto } from "@module/(posts)/post-metadata/dto/post.metadata.dto";
import {
  ApiHideProperty,
  ApiProperty,
  IntersectionType,
  PartialType,
} from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from "class-validator";

class CreatePost {
  @ApiHideProperty()
  @IsUUID()
  @IsOptional()
  authorId?: string;

  @ApiProperty({
    example: "This is my first post!",
    description: "Main text content of the post",
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    example: "https://example.com/image.png",
    description: "Optional media URL attached to the post",
    type: String,
    required: false,
  })
  @IsOptional()
  @IsUrl()
  mediaUrl?: string;

  @ApiProperty({
    enum: mediaType,
    example: "TEXT",
    description: "Type of media attached to the post",
    required: false,
  })
  @IsOptional()
  @IsEnum(mediaType)
  mediaType?: MediaType;

  @ApiProperty({
    enum: postVisibility,
    example: "PUBLIC",
    description: "Visibility of the post",
    required: false,
  })
  @IsOptional()
  @IsEnum(postVisibility)
  visibility?: PostVisibility;

  @ApiProperty({
    example: [
      "9e7a2c12-f0f2-4d6b-b042-123456789abc",
      "f41a1ecb-86f2-4f55-a68d-9876543210de",
    ],
    description: "List of user IDs to tag in this post",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID("all", { each: true })
  taggedUserIds?: string[];

  @ApiHideProperty()
  @IsOptional()
  @IsUUID()
  metadataId?: string;

  @ApiProperty({
    description: "Metadata to create with the post",
    type: CreatePostMetadataDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePostMetadataDto)
  metadata?: CreatePostMetadataDto;
}

export class CreatePostDto extends IntersectionType(CreatePost) {}
export class UpdatePostDto extends PartialType(IntersectionType(CreatePost)) {}
