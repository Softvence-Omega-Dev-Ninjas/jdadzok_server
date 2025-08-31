import { IntersectionType, PartialType } from "@nestjs/swagger";
import { IsDate, IsOptional, IsUUID } from "class-validator";

class UserChoiceDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  choiceId: string;

  @IsDate()
  @IsOptional()
  createdAt?: string;
}

export class CreateUserChoiceDto extends IntersectionType(UserChoiceDto) {}
export class UpdateUserChoiceDto extends PartialType(
  IntersectionType(UserChoiceDto),
) {}
