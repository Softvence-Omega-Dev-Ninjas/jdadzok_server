import { ApiProperty } from "@nestjs/swagger";
import { CommunityType, communityType } from "@project/constants/enums";
import { IsDateString, IsEnum, IsUUID } from "class-validator";

export class CreateCommunityDto {
  @ApiProperty({
    description: "The foundation date of the community",
    example: "2025-08-29T10:30:00.000Z",
  })
  @IsDateString()
  foundationDate: Date;

  @ApiProperty({
    description: "The type of community",
    enum: communityType,
    example: communityType,
  })
  @IsEnum(communityType)
  communityType: CommunityType;

  @ApiProperty({
    description: "The ID of the owner (User ID)",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsUUID()
  ownerId: string;
}
