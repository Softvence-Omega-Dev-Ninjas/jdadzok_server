import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CommunityType } from "@prisma/client";
import { communityType } from "@project/constants/enums";
import { Type } from "class-transformer";
import { IsEnum, IsString, ValidateNested } from "class-validator";
import { CreateSharedProfileDto } from "../../communities/dto/shared.profile.dto";

export class CreateNgoDto {
  @ApiProperty({
    description: "The foundation date of the community",
    example: "30-08-2025",
  })
  @IsString()
  foundationDate: string;
  @ApiProperty({
    description: "The type of community",
    enum: communityType,
    example: "PUBLIC",
  })
  @IsEnum(communityType)
  ngoType: CommunityType;

  @ApiProperty({ type: CreateSharedProfileDto })
  @ValidateNested()
  @Type(() => CreateSharedProfileDto)
  sharedProfile: CreateSharedProfileDto;
}

// update Ngo dto
export class UpdateNgoDto extends PartialType(CreateNgoDto) {}
