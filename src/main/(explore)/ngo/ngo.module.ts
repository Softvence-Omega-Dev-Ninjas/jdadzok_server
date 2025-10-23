import { Module } from "@nestjs/common";
import { NgoController } from "./ngo.controller";
import { NgoService } from "./ngo.service";
import { NgoVerificationModule } from "./ngoVerification/ngo-verification.module";

@Module({
    imports: [NgoVerificationModule],
    controllers: [NgoController],
    providers: [NgoService],
    exports: [],
})
export class NgoModule {}
