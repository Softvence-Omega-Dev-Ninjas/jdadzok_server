import { IntersectionType, PartialType } from "@nestjs/swagger";

class CapLevelDto {

}
export class CreateCapLevelDto extends IntersectionType(CapLevelDto) { }
export class UpdateCapLevelDto extends PartialType(IntersectionType(CapLevelDto)) { }