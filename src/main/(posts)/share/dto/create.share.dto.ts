import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

class CreateShare {
  @ApiProperty({
    example: "user-uuid-here",
    description: "User ID who shared",
    type: String,
    format: "uuid",
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    example: "post-uuid-here",
    description: "Post ID being shared",
    type: String,
    format: "uuid",
  })
  @IsUUID()
  post_id: string;
}
export class CreateShareDto extends IntersectionType(CreateShare) {}
