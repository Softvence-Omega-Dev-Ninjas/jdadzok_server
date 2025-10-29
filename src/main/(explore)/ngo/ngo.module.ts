import { Module } from "@nestjs/common";
import { NgoController } from "./ngo.controller";
import { NgoService } from "./ngo.service";
import { NgoVerificationModule } from "./ngoVerification/ngo-verification.module";
import { BullModule } from "@nestjs/bullmq";
import { QUEUE_JOB_NAME } from "@module/(buill-queue)/constants";
import { NgoVerificationProcessor } from "./ngo.processor";

@Module({
    imports: [
        BullModule.registerQueue({ name: QUEUE_JOB_NAME.VERIFICATION.NGO_VERIFICATION_PROCESSOR }),
        NgoVerificationModule,
    ],
    controllers: [NgoController],
    providers: [NgoService, NgoVerificationProcessor],
    exports: [],
})
export class NgoModule {}
