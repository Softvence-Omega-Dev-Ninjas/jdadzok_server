import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateVolunteerProjectDto {
    @ApiProperty({ description: "Title of the volunteer project" })
    @IsString()
    title: string;

    @ApiProperty({ description: "Description of the volunteer project" })
    @IsString()
    description: string;

    @ApiPropertyOptional({ description: "Location of the project" })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiPropertyOptional({ description: "Whether remote participation is allowed" })
    @IsOptional()
    @IsBoolean()
    remoteAllowed?: boolean;

    @ApiPropertyOptional({ description: "Skills required for the project" })
    @IsOptional()
    @IsString()
    requiredSkills?: string;

    @ApiPropertyOptional({ description: "Time commitment required (e.g., 10 hrs/week)" })
    @IsOptional()
    @IsString()
    timeCommitment?: string;

    @ApiPropertyOptional({ description: "Expected duration of the project (e.g., 3 months)" })
    @IsOptional()
    @IsString()
    duration?: string;
}
