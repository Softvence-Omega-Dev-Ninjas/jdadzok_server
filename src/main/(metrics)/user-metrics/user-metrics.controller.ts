import { GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { Controller, Get, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { VerifiedUser } from "@type/index";
import { UserMetricsResponseDto } from "./dto/user-metrics-response.dto";
import { UserMetricsService } from "./user-metrics.service";

@ApiBearerAuth()
@ApiTags("User Metrics")
@Controller("user-metrics")
export class UserMetricsController {
    constructor(private readonly service: UserMetricsService) {}

    @ApiOperation({ summary: "Get user metrics summary" })
    @ApiResponse({ status: 200, type: UserMetricsResponseDto })
    @Get()
    async getUserMetrics(@GetVerifiedUser() user: VerifiedUser) {
        return this.service.getUserMetrics(user.id);
    }

    @ApiOperation({ summary: "Get metrics of another user by ID" })
    @ApiResponse({ status: 200, type: UserMetricsResponseDto })
    @Get(":userId")
    async getUserMetricsById(@Param("userId") userId: string) {
        return this.service.getUserMetricsById(userId);
    }
}
