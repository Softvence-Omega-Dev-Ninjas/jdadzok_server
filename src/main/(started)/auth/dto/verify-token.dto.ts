import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { IsNumber, IsUUID } from "class-validator";

class VerifyToken {
  @ApiProperty({
    example: 234222,
  })
  @IsNumber()
  token: number;

  @ApiProperty({
    example: "user uuid",
  })
  @IsUUID()
  userId: string;
}
export class VerifyTokenDto extends IntersectionType(VerifyToken) {}
