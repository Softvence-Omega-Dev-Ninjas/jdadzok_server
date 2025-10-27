import { Module } from "@nestjs/common";
import { NgoController } from "./ngo.controller";
import { NgoService } from "./ngo.service";
import { NgoVerificationModule } from "./ngoVerification/ngo-verification.module";
import { PrismaService } from "@lib/prisma/prisma.service";

@Module({
    imports: [NgoVerificationModule],
    controllers: [NgoController],
    providers: [NgoService, PrismaService],
    exports: [NgoService],
})
export class NgoModule {}
