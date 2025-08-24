import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class QueryDto {
    @IsOptional()
    @ApiProperty({ example: 1 })
    @IsNumber()
    page?: number;


    @IsOptional()
    @ApiProperty({ example: 10 })
    @IsNumber()
    limit?: number;

    @IsOptional()
    @ApiProperty({ example: 'example search' })
    @IsString()
    search?: string;

    @IsOptional()
    @ApiProperty({ example: 'createdAt' })
    @IsString()
    sortBy?: string;

    @IsOptional()
    @ApiProperty({ example: 'asc' })
    @IsString()
    order?: 'asc' | 'desc';
}
// import { createZodDto } from '@anatine/zod-nestjs';
// import { extendZodWithOpenApi } from '@anatine/zod-openapi';
// import z from "zod";

// extendZodWithOpenApi(z);
// export const querySchema = z.object({
//     page: z.number().min(1).openapi({ example: 1 }),
//     limit: z.number().min(1).max(100).openapi({ example: 10 }),
//     search: z.string().min(2).max(100).optional().openapi({ example: 'example search' }),
//     sortBy: z.string().optional().openapi({ example: 'createdAt' }),
//     order: z.enum(['asc', 'desc']).optional().openapi({ example: 'asc' }),
// });

// export class QueryDto extends createZodDto(querySchema) { }