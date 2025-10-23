import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    UseGuards,
    Patch,
    UseInterceptors,
    UploadedFile,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { GetUser } from "@common/jwt/jwt.decorator";
import { handleRequest } from "@common/utils/handle.request.util";
import { NgoVerificationService } from "./ngo-verification.service";
import { CreateNgoVerificationDto, ReviewNgoVerificationDto } from "./dto/verification.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import multer from "multer";

@ApiTags("NGO Verification")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("ngo-verifications")
export class NgoVerificationController {
    constructor(private readonly service: NgoVerificationService) {}

    @Post(":ngoId/apply")
    @ApiOperation({ summary: "Apply for NGO verification (upload document to S3)" })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(
        FileInterceptor("document", {
            storage: multer.memoryStorage(),
            limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
        }),
    )
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                verificationType: {
                    type: "string",
                    enum: ["GOVERMENT_ID_OR_PASSPORT", "BUSINESS_CERTIFIED_OR_LICENSE"],
                },
                document: {
                    type: "string",
                    format: "binary",
                },
            },
        },
    })
    async applyVerification(
        @GetUser("userId") userId: string,
        @Param("ngoId") ngoId: string,
        @UploadedFile() document: Express.Multer.File,
        @Body() dto: CreateNgoVerificationDto,
    ) {
        return handleRequest(
            () => this.service.applyVerification(userId, ngoId, dto, document),
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

    @Patch(":verificationId/review")
    @ApiOperation({ summary: "Admin review NGO verification" })
    async reviewVerification(
        @GetUser("userId") adminId: string,
        @Param("verificationId") verificationId: string,
        @Body() dto: ReviewNgoVerificationDto,
    ) {
        return handleRequest(
            () => this.service.reviewVerification(adminId, verificationId, dto),
            "Verification reviewed",
        );
    }
}
