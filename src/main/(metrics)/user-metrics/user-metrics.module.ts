import { Module } from "@nestjs/common";
import { UserMetricsService } from "./user-metrics.service";
import { UserMetricsRepository } from "./user.metrics.repository";
import { UserMetricsController } from "./user-metrics.controller";

@Module({
    providers: [UserMetricsRepository, UserMetricsService],
    controllers: [UserMetricsController],
})
export class UserMetricsModule {}
