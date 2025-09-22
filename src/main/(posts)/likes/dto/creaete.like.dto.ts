import {
  ApiHideProperty,
  ApiProperty,
  IntersectionType,
  PartialType,
} from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

class CreateLike {
  @ApiHideProperty()
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    example: "post-uuid-here",
    type: String,
    format: "uuid",
  })
  @IsUUID()
  postId: string;

  @ApiProperty({
    example: "comment-uuid-here",
    type: String,
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  commentId?: string;
}

export class CreateLikeDto extends IntersectionType(CreateLike) {}
export class UpdateLikeDto extends IntersectionType(PartialType(CreateLike)) {}
