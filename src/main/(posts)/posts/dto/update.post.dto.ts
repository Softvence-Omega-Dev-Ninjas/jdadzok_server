import { IntersectionType, PartialType } from "@nestjs/swagger";
import { CreatePostDto } from "./create.post.dto";

export class UpdatePostDto extends PartialType(
  IntersectionType(CreatePostDto),
) {}
