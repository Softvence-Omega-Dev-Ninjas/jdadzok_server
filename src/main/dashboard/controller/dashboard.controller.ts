import { Controller, ForbiddenException, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DashboardService } from "../service/dashboard.service";
import { PrismaService } from "@lib/prisma/prisma.service";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { VerifiedUser } from "@type/shared.types";

@ApiTags("Admin Dashboard")
@Controller("admin/dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
        private readonly prisma: PrismaService,
    ) {}

    @ApiOperation({ summary: "Super Admin: Get dashboard summary overview" })
    @Get("summary")
    async getSummary(@GetVerifiedUser() user: VerifiedUser) {
        if (user.role !== "SUPER_ADMIN") {
            throw new ForbiddenException("Forbidden access");
        }
        return this.dashboardService.getSummary();
    }

    @ApiOperation({ summary: "Super Admin: Get user growth for last 6 months" })
    @Get("user-growth")
    async getUserGrowth(@GetVerifiedUser() user: VerifiedUser) {
        if (user.role !== "SUPER_ADMIN") {
            throw new ForbiddenException("Forbidden access");
        }
        return this.dashboardService.getUserGrowth();
    }

    @ApiOperation({ summary: "Super Admin: Get revenue trends for last 6 months" })
    @Get("revenue-trends")
    async getRevenueTrends(@GetVerifiedUser() user: VerifiedUser) {
        if (user.role !== "SUPER_ADMIN") {
            throw new ForbiddenException("Forbidden access");
        }
        return this.dashboardService.getRevenueTrends();
    }

    // ---------------------------------------------
    // ACTIVITY DIVISION (percentage)
    // ---------------------------------------------
    //   @ApiOperation({ summary: "Super Admin: Get activity division breakdown" })
    //   @Get('activity-division')
    //   async getActivityDivision(@GetVerifiedUser() user: VerifiedUser) {
    //     if (user.role !== 'SUPER_ADMIN') {
    //       throw new ForbiddenException('Forbidden access');
    //     }
    //     return this.dashboardService.getActivityDivision();
    //   }

    // ---------------------------------------------
    // PENDING APPLICATIONS
    // ---------------------------------------------
    //   @ApiOperation({ summary: "Super Admin: Get pending application counts" })
    //   @Get('pending-applications')
    //   async getPendingApplications(@GetVerifiedUser() user: VerifiedUser) {
    //     if (user.role !== 'SUPER_ADMIN') {
    //       throw new ForbiddenException('Forbidden access');
    //     }
    //     return this.dashboardService.getPendingApplications();
    //   }
}
