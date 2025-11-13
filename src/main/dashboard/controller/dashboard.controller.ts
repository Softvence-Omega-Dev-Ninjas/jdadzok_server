import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { ValidateSuperAdmin } from '@common/jwt/jwt.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateDashboardDto } from '../dto/create-dashboard.dto';
import { UpdateDashboardDto } from '../dto/update-dashboard.dto';
import { DashboardService } from '../service/dashboard.service';

@ApiTags('dashboard-Overview')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  // ---------------admin dashboard user overview-------------
  @ApiOperation({ summary: 'Super Admin get all user overview' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('user-overview')
  async getUserOverview() {
    return this.dashboardService.getUserOverview();
  }

  @Post()
  create(@Body() createDashboardDto: CreateDashboardDto) {
    return this.dashboardService.create(createDashboardDto);
  }

  @Get()
  findAll() {
    return this.dashboardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dashboardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDashboardDto: UpdateDashboardDto) {
    return this.dashboardService.update(+id, updateDashboardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dashboardService.remove(+id);
  }
}
