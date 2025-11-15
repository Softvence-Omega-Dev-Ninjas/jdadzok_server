import { Controller, Get, ForbiddenException, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CommunityNgoService } from "../service/communityNgo.service";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { VerifiedUser } from "@type/shared.types";

@ApiTags("Community & NGO Management")
@Controller("community-ngo")
export class CommunityNgoController {
    constructor(private readonly communityNgoService: CommunityNgoService) {}

    @ApiOperation({ summary: "Super Admin: Get all community & NGO overview statistics" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("overview")
    async getOverview(@GetVerifiedUser() user: VerifiedUser) {
        if (user.role !== "SUPER_ADMIN") throw new ForbiddenException("Forbidden access");
        return this.communityNgoService.getOverview();
    }
}
