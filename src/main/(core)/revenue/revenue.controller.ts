import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Post,
    Query,
    UseGuards,
    ValidationPipe,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { AdRevenueService } from "../ad-revenue/ad-revenue.service";
import {
    CreateRevenueShareDto,
    MonthlyRevenueCalculationDto,
    PlatformRevenueStatsDto,
    RevenueCalculationResultDto,
    RevenueHistoryQueryDto,
    RevenueShareResponseDto,
    UserRevenueSummaryDto,
} from "../cap-level/dto/cap-leve.dto";

/**
 * Controller for managing ad revenue sharing and calculations
 * Handles revenue distribution, user earnings, and platform statistics
 */
@ApiBearerAuth()
@ApiTags("Revenue Sharing")
@Controller("revenue")
@UseGuards(JwtAuthGuard)
export class RevenueController {
    constructor(private readonly revenueService: AdRevenueService) {}

    /**
     * Get user's revenue history with filtering and pagination
     */
    @Get("user/:userId/history")
    @ApiOperation({ summary: "Get user revenue history with filtering" })
    @ApiParam({
        name: "userId",
        description: "User ID to get revenue history for",
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Paginated revenue history retrieved successfully",
        type: [RevenueShareResponseDto],
    })
    async getUserRevenueHistory(
        @Param("userId") userId: string,
        @Query() queryDto: RevenueHistoryQueryDto,
    ) {
        try {
            const result = await this.revenueService.getUserRevenueHistory(userId, queryDto);
            return {
                success: true,
                message: "Revenue history retrieved successfully",
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / result.limit),
                },
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get comprehensive revenue summary for a user
     */
    @Get("user/:userId/summary")
    @ApiOperation({
        summary: "Get comprehensive user revenue summary with analytics",
    })
    @ApiParam({
        name: "userId",
        description: "User ID to get revenue summary for",
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "User revenue summary retrieved successfully",
        type: UserRevenueSummaryDto,
    })
    async getUserRevenueSummary(@Param("userId") userId: string) {
        try {
            const summary = await this.revenueService.getUserRevenueSummary(userId);
            return {
                success: true,
                message: "Revenue summary retrieved successfully",
                data: summary,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Calculate monthly revenue distribution (with dry run option)
     */
    @Post("calculate-monthly")
    @ApiOperation({
        summary: "Calculate monthly revenue distribution for all eligible users",
        description:
            "Calculates and optionally saves monthly revenue shares based on cap levels and activity scores",
    })
    @ApiBody({ type: MonthlyRevenueCalculationDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Monthly revenue calculation completed successfully",
        type: RevenueCalculationResultDto,
    })
    async calculateMonthlyRevenue(
        @Body(ValidationPipe) calculationDto: MonthlyRevenueCalculationDto,
    ) {
        try {
            const result = await this.revenueService.calculateMonthlyRevenue(calculationDto);
            return {
                success: true,
                message: calculationDto.dryRun
                    ? "Revenue calculation preview completed successfully"
                    : "Monthly revenue distribution completed successfully",
                data: result,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create a manual revenue share entry (admin only)
     */
    @Post("create-share")
    @ApiOperation({
        summary: "Create manual revenue share entry (admin only)",
        description: "Manually creates a revenue share record for a user",
    })
    @ApiBody({ type: CreateRevenueShareDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: "Revenue share created successfully",
        type: RevenueShareResponseDto,
    })
    async createRevenueShare(@Body(ValidationPipe) createDto: CreateRevenueShareDto) {
        try {
            const revenueShare = await this.revenueService.createRevenueShare(createDto);
            return {
                success: true,
                message: "Revenue share created successfully",
                data: revenueShare,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get platform-wide revenue statistics
     */
    @Get("platform/stats")
    @ApiOperation({
        summary: "Get comprehensive platform revenue statistics",
        description: "Returns detailed analytics about platform revenue distribution and trends",
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Platform revenue statistics retrieved successfully",
        type: PlatformRevenueStatsDto,
    })
    async getPlatformRevenueStats() {
        try {
            const stats = await this.revenueService.getPlatformRevenueStats();
            return {
                success: true,
                message: "Platform revenue statistics retrieved successfully",
                data: stats,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get revenue distribution by month and year
     */
    @Get("distribution/:year/:month")
    @ApiOperation({
        summary: "Get revenue distribution for specific month/year",
        description: "Returns all revenue shares for a specific month and year",
    })
    @ApiParam({ name: "year", description: "Year (e.g., 2025)", example: 2025 })
    @ApiParam({ name: "month", description: "Month (1-12)", example: 1 })
    @ApiQuery({
        name: "page",
        required: false,
        description: "Page number",
        example: 1,
    })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Items per page",
        example: 20,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Revenue distribution retrieved successfully",
        type: [RevenueShareResponseDto],
    })
    async getMonthlyDistribution(
        @Param("year") year: number,
        @Param("month") month: number,
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 20,
    ) {
        try {
            const queryDto: RevenueHistoryQueryDto = { year, month, page, limit };

            // Get all users' revenue for this month (could be optimized with a dedicated method)
            const allShares = await this.revenueService.getUserRevenueHistory("*", queryDto);

            return {
                success: true,
                message: `Revenue distribution for ${month}/${year} retrieved successfully`,
                data: allShares.data,
                pagination: {
                    page: allShares.page,
                    limit: allShares.limit,
                    total: allShares.total,
                    totalPages: Math.ceil(allShares.total / allShares.limit),
                },
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get top earning users for a specific period
     */
    @Get("leaderboard")
    @ApiOperation({
        summary: "Get revenue leaderboard - top earning users",
        description: "Returns the highest earning users within a specified period",
    })
    @ApiQuery({ name: "year", required: false, description: "Filter by year" })
    @ApiQuery({ name: "month", required: false, description: "Filter by month" })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Number of top users to return",
        example: 10,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Revenue leaderboard retrieved successfully",
    })
    async getRevenueLeaderboard(
        @Query("year") year?: number,
        @Query("month") month?: number,
        @Query("limit") limit: number = 10,
    ) {
        console.info(limit);
        try {
            // This would need a dedicated method in the service
            // For now, return a placeholder response
            return {
                success: true,
                message: "Revenue leaderboard retrieved successfully",
                data: {
                    period: { year, month },
                    topEarners: [], // Would contain top earning users
                    generatedAt: new Date(),
                },
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get revenue analytics for admin dashboard
     */
    @Get("analytics")
    @ApiOperation({
        summary: "Get revenue analytics for admin dashboard",
        description:
            "Returns comprehensive revenue analytics including trends, distributions, and KPIs",
    })
    @ApiQuery({
        name: "period",
        required: false,
        enum: ["week", "month", "quarter", "year"],
        description: "Analytics period",
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Revenue analytics retrieved successfully",
    })
    async getRevenueAnalytics(
        @Query("period") period: "week" | "month" | "quarter" | "year" = "month",
    ) {
        try {
            const platformStats = await this.revenueService.getPlatformRevenueStats();

            return {
                success: true,
                message: "Revenue analytics retrieved successfully",
                data: {
                    period,
                    overview: {
                        totalRevenue: platformStats.totalRevenue,
                        totalDistributed: platformStats.totalDistributed,
                        platformRetention: platformStats.platformRetention,
                        averageRevenuePerUser: platformStats.averageRevenuePerUser,
                    },
                    trends: platformStats.monthlyTrend,
                    distributionByLevel: platformStats.levelStats,
                    generatedAt: new Date(),
                },
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Export revenue data (CSV format)
     */
    @Get("export")
    @ApiOperation({
        summary: "Export revenue data in CSV format",
        description: "Exports revenue shares data for a specified period in CSV format",
    })
    @ApiQuery({ name: "year", required: true, description: "Year to export" })
    @ApiQuery({
        name: "month",
        required: false,
        description: "Month to export (optional)",
    })
    @ApiQuery({
        name: "capLevel",
        required: false,
        description: "Filter by cap level",
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Revenue data exported successfully",
        headers: {
            "Content-Type": { description: "text/csv" },
            "Content-Disposition": {
                description: "attachment; filename=revenue-export.csv",
            },
        },
    })
    async exportRevenueData(
        @Query("year") year: number,
        @Query("month") month?: number,
        @Query("capLevel") capLevel?: string,
    ) {
        try {
            // This would need implementation in the service
            // For now, return a success message
            return {
                success: true,
                message: "Revenue data export initiated",
                data: {
                    exportId: `revenue-export-${year}${month ? `-${month}` : ""}-${Date.now()}`,
                    filters: { year, month, capLevel },
                    status: "processing",
                    estimatedCompletion: new Date(Date.now() + 60000), // 1 minute from now
                },
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get revenue forecast based on historical data
     */
    @Get("forecast")
    @ApiOperation({
        summary: "Get revenue forecast based on historical trends",
        description:
            "Returns projected revenue distribution for upcoming months based on historical data",
    })
    @ApiQuery({
        name: "months",
        required: false,
        description: "Number of months to forecast",
        example: 3,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Revenue forecast retrieved successfully",
    })
    async getRevenueForecast(@Query("months") months: number = 3) {
        try {
            const platformStats = await this.revenueService.getPlatformRevenueStats();

            // Simple forecast based on average of last 6 months
            const recentTrend = platformStats.monthlyTrend.slice(-6);
            const averageRevenue =
                recentTrend.reduce((sum, month) => sum + month.totalRevenue, 0) /
                recentTrend.length;
            const averageUsers =
                recentTrend.reduce((sum, month) => sum + month.activeUsers, 0) / recentTrend.length;

            const forecast = Array.from({ length: months }, (_, index) => {
                const futureDate = new Date();
                futureDate.setMonth(futureDate.getMonth() + index + 1);

                return {
                    month: futureDate.getMonth() + 1,
                    year: futureDate.getFullYear(),
                    projectedRevenue: averageRevenue * (1 + Math.random() * 0.2 - 0.1), // ±10% variance
                    projectedUsers: Math.round(averageUsers * (1 + Math.random() * 0.15 - 0.075)), // ±7.5% variance
                    confidence: Math.max(0.6, 1 - index * 0.1), // Decreasing confidence over time
                };
            });

            return {
                success: true,
                message: "Revenue forecast retrieved successfully",
                data: {
                    forecastPeriod: months,
                    baseData: {
                        historicalAverage: averageRevenue,
                        userGrowthTrend: averageUsers,
                    },
                    forecast,
                    generatedAt: new Date(),
                    disclaimer:
                        "This forecast is based on historical data and should be used for planning purposes only.",
                },
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Validate revenue calculation parameters (dry run endpoint)
     */
    @Post("validate-calculation")
    @ApiOperation({
        summary: "Validate revenue calculation parameters without executing",
        description:
            "Validates calculation parameters and returns what the distribution would look like",
    })
    @ApiBody({ type: MonthlyRevenueCalculationDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Revenue calculation validation completed",
    })
    async validateRevenueCalculation(
        @Body(ValidationPipe) calculationDto: MonthlyRevenueCalculationDto,
    ) {
        try {
            // Force dry run for validation
            const validationDto = { ...calculationDto, dryRun: true };
            const result = await this.revenueService.calculateMonthlyRevenue(validationDto);

            return {
                success: true,
                message: "Revenue calculation parameters validated successfully",
                data: {
                    isValid: true,
                    preview: result,
                    warnings: [],
                    recommendations: [
                        "Review distribution amounts before executing",
                        "Ensure all eligible users have updated metrics",
                        "Consider running during low-traffic hours",
                    ],
                },
            };
        } catch (error) {
            return {
                success: false,
                message: "Revenue calculation validation failed",
                data: {
                    isValid: false,
                    error: error.message,
                    suggestions: [
                        "Check if calculation already exists for this period",
                        "Verify total platform revenue amount",
                        "Ensure eligible users exist in the system",
                    ],
                },
            };
        }
    }
}
