import { PostVisibility, postVisibility } from "@constants/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

export class QueryDto {
  @ApiProperty({ required: false, description: "Search term" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    description: "Number of items to skip",
    default: 0,
  })
  @IsOptional()
  skip?: number;

  @ApiProperty({
    required: false,
    description: "Number of items to take",
    default: 20,
  })
  @IsOptional()
  take?: number;

  @ApiProperty({
    required: false,
    description: "Sort by field",
    default: "createdAt",
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    required: false,
    description: "Sort order",
    enum: ["asc", "desc"],
    default: "desc",
  })
  @IsOptional()
  @IsEnum(["asc", "desc"])
  sortOrder?: "asc" | "desc";

  @ApiProperty({
    required: false,
    description: "Include metadata",
    default: true,
  })
  @IsOptional()
  metadata?: boolean;

  @ApiProperty({
    required: false,
    description: "Include author",
    default: false,
  })
  @IsOptional()
  author?: boolean;

  @ApiProperty({
    required: false,
    description: "Include category",
    default: false,
  })
  @IsOptional()
  category?: boolean;

  @ApiProperty({ required: false, description: "Filter by author ID" })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiProperty({
    required: false,
    description: "Filter by visibility",
    enum: postVisibility,
  })
  @IsOptional()
  @IsEnum(postVisibility)
  visibility?: PostVisibility;
}
