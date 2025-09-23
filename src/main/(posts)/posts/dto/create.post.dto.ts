import {
  mediaType,
  PostForm,
  postFrom,
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
import { MediaType } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

// CreatePost class with missing properties added
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
  @IsOptional()
  text?: string;

  @ApiProperty({
    example: [
      "https://localhost:5056/something.jpg",
      "https://localhost:5056/something.jpg",
    ],
    description: "List of post media URLs",
    type: [String],
    required: false,
  })
  @IsOptional()
  // @IsArray({ each: true })
  mediaUrls?: string[];

  // MediaType property (mediaType was commented out in DTO but it's present in the model)
  @ApiProperty({
    enum: [MediaType], // assuming MediaType includes these values
    example: "IMAGE",
    description: "Type of media attached to the post",
    required: false,
  })
  @IsOptional()
  @IsEnum(mediaType) // Enum of possible media types
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
  @ValidateNested({ each: true })
  @Type(() => CreatePostMetadataDto)
  metadata?: CreatePostMetadataDto;

  @ApiProperty({
    enum: postFrom,
    example: "REGULAR_PROFILE",
    description: "From where you are doing your post",
    required: false,
  })
  @IsEnum(postFrom)
  postFrom: PostForm;

  // New Properties based on the Post Model

  @ApiProperty({
    example: "9e7a2c12-f0f2-4d6b-b042-123456789abc",
    description: "Category of the post",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({
    example: "9e7a2c12-f0f2-4d6b-b042-123456789abc",
    description: "Community associated with the post",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  communityId?: string;

  @ApiProperty({
    example: "9e7a2c12-f0f2-4d6b-b042-123456789abc",
    description: "NGO associated with the post",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  ngoId?: string;

  @ApiProperty({
    description: "Option to accept volunteers for the post",
    required: false,
    example: false,
  })
  @IsOptional()
  @IsEnum([true, false])
  acceptVolunteer?: boolean;

  @ApiProperty({
    description: "Option to accept donations for the post",
    required: false,
    example: false,
  })
  @IsOptional()
  @IsEnum([true, false])
  acceptDonation?: boolean;
}

// DTOs for CreatePost and UpdatePost
export class CreatePostDto extends IntersectionType(CreatePost) {}

export class UpdatePostDto extends PartialType(IntersectionType(CreatePost)) {}
