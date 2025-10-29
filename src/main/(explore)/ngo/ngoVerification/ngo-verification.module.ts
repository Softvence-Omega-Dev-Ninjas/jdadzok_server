import { Module } from "@nestjs/common";
import { PrismaService } from "@lib/prisma/prisma.service";
import { NgoVerificationController } from "./ngo-verification.controller";
import { NgoVerificationService } from "./ngo-verification.service";
import { S3BucketModule } from "@s3/s3.module";

@Module({
    imports: [S3BucketModule],
    controllers: [NgoVerificationController],
    providers: [NgoVerificationService, PrismaService],
    exports: [NgoVerificationService],
})
export class NgoVerificationModule {}
