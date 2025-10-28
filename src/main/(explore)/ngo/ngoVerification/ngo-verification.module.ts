import { PrismaService } from "@lib/prisma/prisma.service";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { S3BucketModule } from "@s3/s3.module";
import { NgoVerificationController } from "./ngo-verification.controller";
import { NgoVerificationService } from "./ngo-verification.service";

@Module({
    imports: [BullModule.registerQueue({ name: "users" }), S3BucketModule],
    controllers: [NgoVerificationController],
    providers: [NgoVerificationService, PrismaService],
    exports: [NgoVerificationService],
})
export class NgoVerificationModule { }
