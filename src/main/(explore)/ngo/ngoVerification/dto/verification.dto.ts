import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { IdentityVerificationType } from "@prisma/client";

export class CreateNgoVerificationDto {
    @ApiProperty({
        enum: IdentityVerificationType,
        example: IdentityVerificationType.GOVERMENT_ID_AND_PASSPORT,
    })
    @IsEnum(IdentityVerificationType)
    verificationType: IdentityVerificationType;

    @ApiProperty({
        type: "string",
        format: "binary",
        description: "Upload a document file (e.g., ID card, certificate, license)",
    })
    document: any; // Multer will handle this file
}

export class ReviewNgoVerificationDto {
    @ApiProperty({ enum: ["APPROVED", "REJECTED"], example: "APPROVED" })
    @IsString()
    status: "APPROVED" | "REJECTED";

    @ApiProperty({ example: "Documents verified successfully." })
    @IsOptional()
    @IsString()
    remarks?: string;
}
