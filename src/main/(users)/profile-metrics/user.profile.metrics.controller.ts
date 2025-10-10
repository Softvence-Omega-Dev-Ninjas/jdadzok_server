import { TUser } from "@app/@types";
import { successResponse } from "@app/common/utils/response.util";
import { GetUser } from "@common/jwt/jwt.decorator";
import { Body, Controller, Post } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CreateUserProfileMetricsDto } from "./dto/user.profile.metrics";
import { UserProfileMetricsService } from "./user.profile.metrics.service";

@ApiBearerAuth()
@Controller("user-profile-metrics")
export class UserProfileMetricsController {
    constructor(private readonly profileService: UserProfileMetricsService) {}
    @Post()
    async createMetrics(@GetUser() user: TUser, @Body() body: CreateUserProfileMetricsDto) {
        try {
            const profile = await this.profileService.create(user.userId, body);
            return successResponse(profile, "Profile update successfully");
        } catch (err) {
            return err;
        }
    }
}
