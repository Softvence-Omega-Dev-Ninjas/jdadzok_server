import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserMetrics } from "@prisma/client";
import { CreateUserMetricsDto, UpdateUserMetricsDto } from "./dto/user-metrics.dto";
import { UserMetricsService } from "./user-metrics.service";

@ApiTags("User Metrics")
@Controller("user-metrics")
export class UserMetricsController {
    constructor(private readonly userMetricsService: UserMetricsService) {}

    @Post()
    @ApiOperation({ summary: "Create User Metrics" })
    @ApiResponse({ status: 201, description: "Metrics successfully created." })
    @ApiResponse({ status: 400, description: "Bad Request." })
    create(@Body() createUserMetricsDto: CreateUserMetricsDto): Promise<UserMetrics> {
        return this.userMetricsService.create(createUserMetricsDto);
    }

    @Get(":userId")
    @ApiOperation({ summary: "Get User Metrics by userId" })
    @ApiResponse({ status: 200, description: "User Metrics fetched successfully." })
    @ApiResponse({ status: 404, description: "UserMetrics not found." })
    findOne(@Param("userId") userId: string): Promise<UserMetrics> {
        return this.userMetricsService.findOne(userId);
    }

    @Put(":userId")
    @ApiOperation({ summary: "Update User Metrics by userId" })
    @ApiResponse({ status: 200, description: "User Metrics updated successfully." })
    @ApiResponse({ status: 404, description: "UserMetrics not found." })
    update(
        @Param("userId") userId: string,
        @Body() updateUserMetricsDto: UpdateUserMetricsDto,
    ): Promise<UserMetrics> {
        return this.userMetricsService.update(userId, updateUserMetricsDto);
    }

    @Get()
    @ApiOperation({ summary: "Get all User Metrics" })
    @ApiResponse({ status: 200, description: "Fetched all user metrics successfully." })
    findAll(): Promise<UserMetrics[]> {
        return this.userMetricsService.findAll();
    }
}
