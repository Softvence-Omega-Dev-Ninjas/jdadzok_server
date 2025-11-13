import { Controller, Delete, Get, Param } from "@nestjs/common";

import { ValidateSuperAdmin } from "@common/jwt/jwt.decorator";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DashboardService } from "../service/dashboard.service";

@ApiTags("dashboard-Overview")
@Controller("dashboard")
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    // ---------------admin dashboard user overview-------------
    @ApiOperation({ summary: "Super Admin get all user overview" })
    @ApiBearerAuth()
    @ValidateSuperAdmin()
    @Get("user-overview")
    async getUserOverview() {
        return this.dashboardService.getUserOverview();
    }

    // @Post()
    // create(@Body() createDashboardDto: CreateDashboardDto) {
    //     return this.dashboardService.create(createDashboardDto);
    // }

    @Get()
    findAll() {
        return this.dashboardService.findAll();
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.dashboardService.findOne(+id);
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.dashboardService.remove(+id);
    }
}
