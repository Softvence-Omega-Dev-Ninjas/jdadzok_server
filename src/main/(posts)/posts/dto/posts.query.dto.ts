import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsEnum, IsString } from "class-validator";
import { Feelings } from "@prisma/client"; // or your enum path

export class PostQueryDto {
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

    @ApiProperty({
        required: false,
        type: String,
        description: "Search by post text or author name",
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({
        required: false,
        enum: Feelings,
        isArray: true,
        description: "Filter posts by feelings",
    })
    @IsOptional()
    @IsEnum(Feelings, { each: true })
    feelings?: Feelings[];
}

export class PostQueryFilterDto extends PartialType(PostQueryDto) {}
