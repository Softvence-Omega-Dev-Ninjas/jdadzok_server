import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";

class CreateChoice {
  @ApiProperty({
    example: "Life Hacks",
  })
  @IsString()
  text: string;

  @ApiProperty({
    example: "life-hacks",
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    example: "user-uuid",
  })
  @IsOptional()
  @IsUUID()
  user_id?: string;
}
export class CreateChoiceDto extends IntersectionType(CreateChoice) {}
