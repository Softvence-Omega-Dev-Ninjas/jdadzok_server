import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class EventQueryDto {
    @ApiPropertyOptional({
        description: "Search events by project title or NGO name",
        example: "cleanup",
    })
    @IsOptional()
    @IsString()
    search?: string;
}
