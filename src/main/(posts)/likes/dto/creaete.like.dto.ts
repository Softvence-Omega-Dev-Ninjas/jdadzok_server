import {
  ApiHideProperty,
  ApiProperty,
  IntersectionType,
} from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class CreateLike {
  @ApiHideProperty()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    example: "post-uuid-here",
    type: String,
    format: "uuid",
  })
  @IsOptional()
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
