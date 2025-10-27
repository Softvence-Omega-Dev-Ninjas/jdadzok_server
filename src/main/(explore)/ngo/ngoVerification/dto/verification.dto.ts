import { IdentityVerificationType, identityVerificationType } from "@constants/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class CreateNgoVerificationDto {
    @ApiProperty({
<<<<<<< HEAD
        enum: IdentityVerificationType,
        example: IdentityVerificationType.GOVERMENT_ID_AND_PASSPORT,
=======
        enum: identityVerificationType,
        example: identityVerificationType[0],
>>>>>>> 98cea0cac28ca706771e7a8eb0617920bf427394
    })
    @IsEnum(identityVerificationType)
    verificationType: IdentityVerificationType;

    @ApiProperty({
        type: "string",
        format: "binary",
        description: "Upload a document file (e.g., ID card, certificate, license)",
    })
    documents: Array<Express.Multer.File>; // Multer will handle this file
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
