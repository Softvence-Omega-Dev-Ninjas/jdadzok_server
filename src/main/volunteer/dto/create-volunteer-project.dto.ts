import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsDateString } from "class-validator";

export class CreateVolunteerProjectDto {
    @ApiProperty({ example: "ngo id" })
    @IsString()
    @IsNotEmpty()
    ngoId: string;

    @ApiProperty({ example: "Community Tree Planting" })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: "Help plant trees and clean the local area." })
    @IsString()
    description: string;

    @ApiProperty({ example: "Dhaka, Bangladesh", required: false })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ example: "2025-12-01", required: false })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({ example: "2025-12-20", required: false })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}
