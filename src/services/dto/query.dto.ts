import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class QueryDto {
    @ApiProperty({ example: 1 })
    @IsOptional()
    @IsNumber()
    page?: number;


    @ApiProperty({ example: 10 })
    @IsOptional()
    @IsNumber()
    limit?: number;

    @ApiProperty({ example: 'example search' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ example: 'createdAt' })
    @IsOptional()
    @IsEnum({
        createdAt: "createdAt",
        updatedAt: "updatedAt"
    })
    sortBy?: string;

    @ApiProperty({ example: 'asc' })
    @IsOptional()
    @IsEnum({
        asc: 'asc',
        desc: 'desc'
    })
    order?: 'asc' | 'desc';

    @ApiProperty({ example: 0 })
    @IsOptional()
    @IsNumber()
    skip?: number;
}
