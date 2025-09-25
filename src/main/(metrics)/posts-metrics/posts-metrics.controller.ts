import { Controller, Get, UseGuards } from "@nestjs/common";
import { PostsMetricsService } from "./posts-metrics.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { GetVerifiedUser } from "@project/common/jwt/jwt.decorator";
import { TUser } from "@project/@types";

@ApiBearerAuth()
@ApiTags("Posts Metrics")
@UseGuards()
@Controller("posts-metrics")
export class PostsMetricsController {
    constructor(private readonly postsMetricsService: PostsMetricsService) {}

    @Get()
    async getPostsMetrics(@GetVerifiedUser() user: TUser) {
        try {
            return await this.postsMetricsService.get(user.userId);
        } catch (err) {
            return err;
        }
    }
}
