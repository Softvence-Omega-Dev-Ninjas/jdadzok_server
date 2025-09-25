import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import { PaginationDto } from "@project/global/dto/pagination";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

class PostQueryDataTransferObject {
    @ApiProperty({ required: false, default: false, type: Boolean })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === "true" || value === true)
    metadata?: boolean;

    @ApiProperty({ required: false, default: false, type: Boolean })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === "true" || value === true)
    author?: boolean;
}

export class PostQueryDto extends PartialType(
    IntersectionType(PaginationDto, PostQueryDataTransferObject),
) {}
