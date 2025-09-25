import { Module } from "@nestjs/common";
import { UserMetricsService } from "../../(users)/profile-metrics/user-metrics.service";
import { AdRevenueService } from "../ad-revenue/ad-revenue.service";
import { RevenueController } from "../revenue/revenue.controller";
import { VolunteerTrackingService } from "../volunteer-tracking/volunteer-tracking.service";
import { CapLevelRepository } from "./cap-lavel.repository";
import { CapLevelService } from "./cap-lavel.service";
import { CapLevelController } from "./cap-level.controller";
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
    imports: [],
    controllers: [CapLevelController, RevenueController],
    providers: [
        CapLevelRepository,
        CapLevelService,
        UserMetricsService,
        AdRevenueService,
        VolunteerTrackingService,
    ],
    exports: [CapLevelService, UserMetricsService, AdRevenueService, VolunteerTrackingService],
})
export class CapLevelModule {}
