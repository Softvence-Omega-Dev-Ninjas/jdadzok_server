import { Controller, ForbiddenException, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PayoutManagementService } from "../service/payout.management.service";
import { GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { VerifiedUser } from "@type/shared.types";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";

@ApiTags("Payout-management")
@Controller("admin/payoutManagement")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PayoutManagementController {
    constructor(private readonly dashboardService: PayoutManagementService) {}

    @ApiOperation({ summary: "Super Admin: Get dashboard summary overview" })
    @Get("summary")
    async getSummary(@GetVerifiedUser() user: VerifiedUser) {
        if (user.role !== "SUPER_ADMIN") {
            throw new ForbiddenException("Forbidden access");
        }
        return this.dashboardService.getSummary();
    }
}
