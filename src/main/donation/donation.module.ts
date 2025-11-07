import { Module } from "@nestjs/common";
import { DonationController } from "./controller/donation.controller";
import { DonationService } from "./services/donation.service";

@Module({
    controllers: [DonationController],
    providers: [DonationService],
})
export class DonationModule {}
