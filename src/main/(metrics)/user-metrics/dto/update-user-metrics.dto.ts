import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateUserMetricsDto {
    @ApiProperty({ example: 'uuid-of-user', description: 'User ID' })
    @IsUUID()
    userId: string;

    @ApiProperty({ example: 1, required: false })
    @IsOptional() @IsInt() @Min(0)
    totalPosts?: number;

    @ApiProperty({ example: 10, required: false })
    @IsOptional() @IsInt() @Min(0)
    totalComments?: number;

    @ApiProperty({ example: 15, required: false })
    @IsOptional() @IsInt() @Min(0)
    totalLikes?: number;

    @ApiProperty({ example: 5, required: false })
    @IsOptional() @IsInt() @Min(0)
    totalShares?: number;

    @ApiProperty({ example: 20, required: false })
    @IsOptional() @IsInt() @Min(0)
    totalFollowers?: number;

    @ApiProperty({ example: 8, required: false })
    @IsOptional() @IsInt() @Min(0)
    totalFollowing?: number;

    @ApiProperty({ example: 5, required: false })
    @IsOptional() @IsInt() @Min(0)
    volunteerHours?: number;

    @ApiProperty({ example: 1, required: false })
    @IsOptional() @IsInt() @Min(0)
    completedProjects?: number;
}
