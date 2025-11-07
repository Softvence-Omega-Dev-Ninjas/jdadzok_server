import { GetUser, ValidateAuth } from "@common/jwt/jwt.decorator";
import { BadRequestException, Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateDonationDto } from "../dto/create-donation.dto";
import { DonationService } from "../services/donation.service";

@ApiTags("Donations")
@Controller("donation")
export class DonationController {
    constructor(private readonly donationService: DonationService) {}

    @ApiBearerAuth()
    @ValidateAuth()
    @ApiOperation({ summary: "Create a donation to a community" })
    @Post(":communityId")
    async create(
        @Param("communityId") communityId: string,
        @Body() payload: CreateDonationDto,
        @GetUser("userId") userId: string,
    ) {
        if (!userId) throw new BadRequestException("User not authenticated");
        return this.donationService.createCheckoutSession(userId, communityId, payload);
    }

    @ApiBearerAuth()
    @ValidateAuth()
    @ApiOperation({ summary: "Get my donation payments" })
    @Get("/my-payments")
    async findMyPayments(@GetUser("userId") userId: string) {
        return this.donationService.findMyPayments(userId);
    }

    @ApiOperation({ summary: "Get all donations (admin)" })
    @Get("/all-donations")
    async findAll() {
        return this.donationService.findAllPayments();
    }
}
