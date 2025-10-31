import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min, Max } from "class-validator";

export class LogHoursDto {
    @ApiProperty({ example: 5 })
    @IsInt()
    @Min(1)
    @Max(352)
    hours: number;
}
