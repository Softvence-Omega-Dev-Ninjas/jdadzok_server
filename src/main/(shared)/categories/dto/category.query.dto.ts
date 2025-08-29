import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import { QueryDto } from "@project/services/dto/query.dto";

class CategoryQueryDataTransferObject {
  @ApiProperty({
    example: "Technology",
    description: "Name of the category",
  })
  name: string;
}
export class CategoryQueryDto extends PartialType(
  IntersectionType(QueryDto, CategoryQueryDataTransferObject),
) { }
