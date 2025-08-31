import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CommunityType, communityType } from '@project/constants/enums';
import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { CreateSharedProfileDto } from './shared.profile.dto';

export class CreateCommunityDto {
    @ApiProperty({
        description: 'The foundation date of the community',
        example: '30-08-2025',
    })

    @IsString()
    foundationDate: string;

    @ApiProperty({
        description: 'The type of community',
        enum: communityType,
        example: 'PUBLIC',
    })
    @IsEnum(communityType)
    communityType: CommunityType;

    @ApiProperty({ type: CreateSharedProfileDto })
    @ValidateNested()
    @Type(() => CreateSharedProfileDto)
    sharedProfile: CreateSharedProfileDto;
}

// update community dto
export class UpdateCommunityDto extends PartialType(CreateCommunityDto) { }