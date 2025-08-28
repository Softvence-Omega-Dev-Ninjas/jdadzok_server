import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import { QueryDto } from "@project/services/dto/query.dto";
import { IsBoolean } from "class-validator";

class PostQueryDataTransferObject {
  @ApiProperty({ default: false, required: false })
  @IsBoolean()
  metadata?: boolean;

  @ApiProperty({ default: false, required: false })
  @IsBoolean()
  author?: boolean;
}

export class PostQueryDto extends PartialType(
  IntersectionType(QueryDto, PostQueryDataTransferObject),
) {}
// export class PostQueryDto extends PartialType(
//   IntersectionType(PostQueryDataTransferObject),
// ) { }
