// src/newsfeed/dto/feed.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class FeedQueryDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    cursor?: string;

    @ApiProperty({ required: false, default: 20 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt()
    @Min(1)
    take?: number;
}
