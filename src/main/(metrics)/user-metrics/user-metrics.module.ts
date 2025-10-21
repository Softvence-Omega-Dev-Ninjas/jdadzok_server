import { Module } from "@nestjs/common";
import { UserMetricsController } from "./user-metrics.controller";
import { UserMetricsService } from "./user-metrics.service";
import { UserMetricsRepository } from "./user.metrics.repository";

@Module({
    controllers: [UserMetricsController],
    providers: [UserMetricsRepository, UserMetricsService],
    exports: [UserMetricsService],
})
export class UserMetricsModule {}
