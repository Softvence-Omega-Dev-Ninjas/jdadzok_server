import { GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { handleRequest } from "@common/utils/handle.request.util";
import { identityVerificationType } from "@constants/enums";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { VerifiedUser } from "@type/shared.types";
import multer from "multer";
import { CreateNgoVerificationDto, ReviewNgoVerificationDto } from "./dto/verification.dto";
import { NgoVerificationService } from "./ngo-verification.service";

@ApiTags("NGO Verification")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("ngo-verifications")
export class NgoVerificationController {
    constructor(private readonly service: NgoVerificationService) {}

    @Post(":ngoId/apply")
    @ApiOperation({ summary: "Apply for NGO verification (upload document to S3)" })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                verificationType: {
                    type: "string",
                    enum: [...identityVerificationType], // ✅ convert readonly to mutable
                },
                files: {
                    type: "array",
                    items: {
                        type: "string",
                        format: "binary",
                    },
                    maxItems: 20,
                },
            },
        },
    })
    @UseInterceptors(
        FilesInterceptor("files", 20, {
            storage: multer.memoryStorage(),
            limits: { files: 20 }, // TODO: based on the cap level it will be incress and dicress
        }),
    )
    async applyVerification(
        @GetVerifiedUser() user: VerifiedUser,
        @Param("ngoId") ngoId: string,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() dto: CreateNgoVerificationDto,
    ) {
        return handleRequest(
            () => this.service.applyVerification(user.id, ngoId, dto, files),
            "Verification request submitted",
        );
    }

    @Get(":ngoId/status")
    @ApiOperation({ summary: "Get NGO verification status" })
    async getVerificationStatus(@Param("ngoId") ngoId: string) {
        return handleRequest(
            () => this.service.getVerificationStatus(ngoId),
            "Fetched verification status",
        );
    }
    @UseGuards(JwtAuthGuard)
    @Patch(":verificationId/review")
    @ApiOperation({ summary: "Admin review NGO verification" })
    async reviewVerification(
        @GetVerifiedUser() user: VerifiedUser,
        @Param("verificationId") verificationId: string,
        @Body() dto: ReviewNgoVerificationDto,
    ) {
        return handleRequest(
            () => this.service.reviewVerification(user.id, verificationId, dto),
            "Verification reviewed",
        );
    }
}
