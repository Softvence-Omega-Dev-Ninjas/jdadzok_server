import {
    Controller,
    Get,
    Query,
    Patch,
    Param,
    UseGuards,
    ForbiddenException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { VerifiedUser } from "@type/index";
import { DashboardService } from "../service/dashboard.service";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { PrismaService } from "@lib/prisma/prisma.service";
import { GetUsersQueryDto } from "../dto/query.dto";

@ApiTags("Admin Dashboard")
@Controller("admin/dashboard")
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
        private readonly prisma: PrismaService,
    ) {}

    // ---------------- SUMMARY OVERVIEW ----------------
    @ApiOperation({ summary: "Super Admin: Get all user overview statistics" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("user-overview")
    async getUserOverview(@GetVerifiedUser() user: VerifiedUser) {
        if (user.role !== "SUPER_ADMIN") throw new ForbiddenException("Forbiden accesss");
        return this.dashboardService.getUserOverview();
    }

    // ---------------- USER LIST ----------------
    @ApiOperation({ summary: "Super Admin: List users with search & filters" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("users")
    async getUsers(@GetVerifiedUser() user: VerifiedUser, @Query() query: GetUsersQueryDto) {
        if (user.role !== "SUPER_ADMIN") throw new ForbiddenException("Forbiden accesss");
        const { search, status, role, page, limit } = query;
        const users = await this.dashboardService.getUsers({
            search,
            status,
            role,
            page: page ?? 1,
            limit: limit ?? 10,
        });

        return users;
    }

    // ---------------- SUSPEND USER ----------------
    @ApiOperation({ summary: "Super Admin: Suspend a user" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch("users/:id/suspend")
    async suspendUser(@GetVerifiedUser() user: VerifiedUser, @Param("id") id: string) {
        if (user.role !== "SUPER_ADMIN") throw new ForbiddenException("Forbiden accesss");
        return this.dashboardService.suspendUser(id);
    }

    // ---------------- ACTIVATE USER ----------------
    @ApiOperation({ summary: "Super Admin: Activate a user" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch("users/:id/activate")
    async activateUser(@GetVerifiedUser() user: VerifiedUser, @Param("id") id: string) {
        if (user.role !== "SUPER_ADMIN") throw new ForbiddenException("Forbiden accesss");
        return this.dashboardService.activateUser(id);
    }
}
