import { QUEUE_JOB_NAME } from "@module/(buill-queue)/constants";
import { UserModule } from "@module/(users)/users/users.module";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { UserMetricsService } from "../../(users)/profile-metrics/user-metrics.service";
import { AdRevenueService } from "../ad-revenue/ad-revenue.service";
import { RevenueController } from "../revenue/revenue.controller";
import { VolunteerTrackingService } from "../volunteer-tracking/volunteer-tracking.service";
import { CapLevelRepository } from "./cap-lavel.repository";
import { CapLevelService } from "./cap-lavel.service";
import { CapLevelController } from "./cap-level.controller";
import { CapLevelCronJobProcessor } from "./cron/cap-level.cron-job.processor";
import { CapLevelCronJobService } from "./cron/cap-level.cron-job.service";
import { CapLevelProcessorService } from "./cron/cap-level.processor.service";
/**
 * Cap Level Module - Comprehensive cap level management system
 *
 * This module handles:
 * - Cap level progression and management
 * - User activity scoring and metrics tracking
 * - Ad revenue sharing and calculations
 * - Volunteer activity tracking and 8-week service completion
 * - Real-time notifications and background processing
 *
 * Features:
 * - Automated cap level promotions based on activity scores and volunteer hours
 * - Monthly revenue distribution with configurable percentages per cap level
 * - Comprehensive analytics and reporting
 * - Admin tools for manual adjustments and bulk operations
 * - Integration with user engagement systems
 */
@Module({
    imports: [
        BullModule.registerQueue({
            name: QUEUE_JOB_NAME.CAP_LEVEL.CAP_LEVEL_QUEUE_NAME,
        }),
        UserModule
    ],
    controllers: [CapLevelController, RevenueController],
    providers: [
        CapLevelCronJobProcessor, // and this is for processing our cron jobs
        CapLevelCronJobService, // this is for cron job
        CapLevelRepository,
        CapLevelService,
        CapLevelProcessorService,
        UserMetricsService,
        AdRevenueService,
        VolunteerTrackingService,
    ],
    exports: [CapLevelService, UserMetricsService, AdRevenueService, VolunteerTrackingService],
})
export class CapLevelModule { }
