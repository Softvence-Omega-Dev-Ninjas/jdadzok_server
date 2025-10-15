import { GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { Body, Controller, Get, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { VerifiedUser } from "@type/index";
import { CalculateActivityScoreDto } from "./dto/activity-score.dto";
import { UpdateUserMetricsDto } from "./dto/update-user-metrics.dto";
import { UserMetricsResponseDto } from "./dto/user-metrics-response.dto";
import { UserMetricsService } from "./user-metrics.service";

@ApiTags("User Metrics")
@Controller("user-metrics")
export class UserMetricsController {
    constructor(private readonly service: UserMetricsService) { }

    @ApiOperation({ summary: "Get user metrics summary" })
    @ApiResponse({ status: 200, type: UserMetricsResponseDto })
    @Get()
    async getUserMetrics(@GetVerifiedUser() user: VerifiedUser) {
        return this.service.getUserMetrics(user.id);
    }

    @ApiOperation({ summary: "Update user activity metrics" })
    @ApiResponse({ status: 200, type: UserMetricsResponseDto })
    @Put("update")
    async updateUserMetrics(
        @GetVerifiedUser() user: VerifiedUser,
        @Body() dto: UpdateUserMetricsDto,
    ) {
        return this.service.updateMetrics({ ...dto, userId: user.id });
    }

    @ApiOperation({ summary: "Recalculate user activity score" })
    @ApiResponse({ status: 200, type: UserMetricsResponseDto })
    @Post("activity-score")
    async calculateActivityScore(@Body() dto: CalculateActivityScoreDto) {
        return this.service.calculateActivityScore(dto);
    }
}
