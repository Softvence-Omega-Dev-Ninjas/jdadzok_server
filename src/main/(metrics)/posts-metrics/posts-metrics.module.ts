import { Module } from "@nestjs/common";
import { PostsMetricsService } from "./posts-metrics.service";
import { PostsMetricsController } from "./posts-metrics.controller";

@Module({
    providers: [PostsMetricsService],
    controllers: [PostsMetricsController],
})
export class PostsMetricsModule {}
