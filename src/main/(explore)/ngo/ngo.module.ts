import { Module } from "@nestjs/common";
import { NgoController } from "./ngo.controller";
import { NgoService } from "./ngo.service";
import { NgoVerificationModule } from "./ngoVerification/ngo-verification.module";
import { NgoVerificationProcessor } from "./ngoVerification/ngo.processor";

@Module({
    imports: [NgoVerificationModule],
    controllers: [NgoController],
    providers: [NgoVerificationProcessor, NgoService],
    exports: [],
})
export class NgoModule { }
