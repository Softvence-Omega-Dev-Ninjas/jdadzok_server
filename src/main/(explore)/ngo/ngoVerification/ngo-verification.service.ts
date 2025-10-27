import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "@lib/prisma/prisma.service";

import { VerificationStatus } from "@prisma/client";
import { CreateNgoVerificationDto, ReviewNgoVerificationDto } from "./dto/verification.dto";
import { S3Service } from "@s3/s3.service";

@Injectable()
export class NgoVerificationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly s3Service: S3Service,
    ) {}

    // NGO applies for verification
    async applyVerification(
        userId: string,
        ngoId: string,
        dto: CreateNgoVerificationDto,
        document: Express.Multer.File,
    ) {
        const ngo = await this.prisma.ngo.findUnique({
            where: { id: ngoId },
            include: { owner: true },
        });
        if (!ngo) throw new NotFoundException("NGO not found");
        if (ngo.ownerId !== userId)
            throw new ForbiddenException("You are not authorized for this NGO");

        const existing = await this.prisma.ngoVerification.findFirst({
            where: { ngoId, status: { in: ["PENDING", "APPROVED"] } },
        });
        if (existing)
            throw new BadRequestException(
                "A verification request already exists or has been approved",
            );

        if (!document) {
            throw new BadRequestException("Document file is required");
        }

        // Upload to S3
        const [documentUrl] = await this.s3Service.uploadFiles<string>([document]);

        // Save in DB
        return await this.prisma.ngoVerification.create({
            data: {
                ngoId,
                verificationType: dto.verificationType,
                documentUrl,
            },
        });
    }

    // Get current status
    async getVerificationStatus(ngoId: string) {
        const verification = await this.prisma.ngoVerification.findFirst({
            where: { ngoId },
            orderBy: { createdAt: "desc" },
        });
        if (!verification) throw new NotFoundException("No verification record found");

        return verification;
    }

    // Admin reviews a verification request
    async reviewVerification(
        adminId: string,
        verificationId: string,
        dto: ReviewNgoVerificationDto,
    ) {
        const user = await this.prisma.user.findUnique({ where: { id: adminId } });
        if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
            throw new BadRequestException("Sorry unauthorized access.");
        }
        const verification = await this.prisma.ngoVerification.findUnique({
            where: { id: verificationId },
        });
        if (!verification) throw new NotFoundException("Verification request not found");

        const updated = await this.prisma.ngoVerification.update({
            where: { id: verificationId },
            data: {
                status: dto.status,
                reviewedById: adminId,
            },
        });

        if (dto.status === VerificationStatus.APPROVED) {
            await this.prisma.ngo.update({
                where: { id: verification.ngoId },
                data: { isVerified: true },
            });
        }

        if (dto.status === VerificationStatus.REJECTED) {
            await this.prisma.ngo.update({
                where: { id: verification.ngoId },
                data: { isVerified: false },
            });
        }

        return updated;
    }
}
