import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class PostQueryDataTransferObject {
    @ApiProperty({ default: false, required: false })
    @IsOptional()
    @IsBoolean()
    metadata?: boolean;

    @ApiProperty({ default: false, required: false })
    @IsOptional()
    @IsBoolean()
    author?: boolean;

    @ApiProperty({ default: false, required: false })
    @IsOptional()
    @IsBoolean()
    category?: boolean;
}