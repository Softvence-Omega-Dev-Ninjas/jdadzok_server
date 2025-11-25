import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { Controller, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { DonationService } from "./donation.service";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("donation")
export class DonationController {
    constructor(private readonly service: DonationService) {}
}
