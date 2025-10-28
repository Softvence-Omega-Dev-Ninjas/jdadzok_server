import { verificationStatus } from "@constants/enums";
import { PrismaService } from "@lib/prisma/prisma.service";
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { S3Service } from "@s3/s3.service";
import { CreateNgoVerificationDto, ReviewNgoVerificationDto } from "./dto/verification.dto";

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
        documents: Array<Express.Multer.File>,
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

        if (!documents) {
            throw new BadRequestException("Documents file is required");
        }

        // Upload to S3
        const uploadedDocs = await this.s3Service.uploadFiles(documents);

        // Save in DB
        const verification = await this.prisma.ngoVerification.create({
            data: {
                ngoId,
                ...dto,
                documents: uploadedDocs,
            },
        });
        // TODO: once verification create successfully then add this verification apply to the queue job
        // Do here...
        return verification;
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

        if (verificationStatus.includes(dto.status)) {
            await this.prisma.ngo.update({
                where: { id: verification.ngoId },
                data: { isVerified: dto.status === "APPROVED" ? true : false },
            });
        }
        return updated;
    }
}
