import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class CreateLike {
  @ApiProperty({
    example: "1111aaaa-2222-bbbb-3333-cccc4444dddd",
    description: "User ID who liked",
    type: String,
    format: "uuid",
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    example: "post-uuid-here",
    description: "Optional post ID being liked",
    type: String,
    format: "uuid",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  post_id?: string;

  @ApiProperty({
    example: "comment-uuid-here",
    description: "Optional comment ID being liked",
    type: String,
    format: "uuid",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  comment_id?: string;
}

export class CreateLikeDto extends IntersectionType(CreateLike) {}
