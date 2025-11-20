import { Controller, ForbiddenException, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { IncomeAnalyticService } from "../service/incomeAnalytic.service";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { VerifiedUser } from "@type/shared.types";

@ApiTags("Income & Analytic")
@Controller("income-analytic")
export class IncomeAnalyticController {
    constructor(private readonly incomeAnalyticService: IncomeAnalyticService) {}

    @ApiOperation({ summary: "Super Admin: Get Income & Analytic overview statistics" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("overview")
    async getOverview(@GetVerifiedUser() user: VerifiedUser) {
        if (user.role !== "SUPER_ADMIN") throw new ForbiddenException("Forbidden access");
        return this.incomeAnalyticService.getOverview();
    }

    @ApiOperation({ summary: "Super Admin: Get all community & NGO overview statistics" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("revenue-growth")
    async getRevenueGrowth(@GetVerifiedUser() user: VerifiedUser) {
        if (user.role !== "SUPER_ADMIN") throw new ForbiddenException("Forbidden access");
        return this.incomeAnalyticService.getRevenueGrowth();
    }
}
