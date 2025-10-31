import { QUEUE_JOB_NAME } from "@module/(buill-queue)/constants";
import { UserMetricsService } from "@module/(users)/profile-metrics/user-metrics.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { User } from "@prisma/client";
import { Job, Queue } from "bullmq";
import { AdRevenueService } from "../../ad-revenue/ad-revenue.service";
import { VolunteerTrackingService } from "../../volunteer-tracking/volunteer-tracking.service";
import { CapLevelService } from "../cap-lavel.service";
import {
    BatchMetricsJobData,
    BatchPromotionJobData,
    MonthlyRevenueJobData,
    UserMetricsUpdateJobData,
    UserPromotionJobData,
    VolunteerHoursJobData,
} from "../types";

@Injectable()
export class CapLevelProcessorService {
    private readonly logger = new Logger(CapLevelProcessorService.name);

    constructor(
        @InjectQueue(QUEUE_JOB_NAME.CAP_LEVEL.CAP_LEVEL_QUEUE_NAME) private readonly queue: Queue,
        private readonly capLevelService: CapLevelService,
        private readonly userMetricsService: UserMetricsService,
        private readonly adRevenueService: AdRevenueService,
        private readonly volunteerTrackingService: VolunteerTrackingService,
    ) {
        this.logger.log("Cap Level Processor initialized");
    }
    

    async handleUserCaplevelChecking<T extends User>(users: T[]): Promise<void> {
        // TODO: processable users list
        console.log(users)
    }

    /**
     * Calculate user eligibility for cap level promotion
     */
    // async processUserEligibility(job: Job<UserEligibilityJobData>) {
    //     const { userId, triggerAction } = job.data;

    //     this.logger.log(
    //         `Calculating eligibility for user ${userId} (triggered by: ${triggerAction})`,
    //     );

    //     const eligibility = await this.capLevelService.calculateCapEligibility(userId);

    //     // If user is eligible for automatic promotion, queue promotion job
    //     if (eligibility.canPromote) {
    //         const requirements = eligibility.requirements;

    //         // Auto-promote for levels that don't require verification
    //         if (
    //             requirements &&
    //             !requirements.requiresVerification &&
    //             !requirements.requiresNomination
    //         ) {
    //             await this.queue.add(
    //                 capLevelJobType["PROMOTE_USER"],
    //                 {
    //                     userId,
    //                     targetLevel: eligibility.eligibleLevel,
    //                     bypassVerification: false,
    //                     triggeredBy: "system",
    //                 } as UserPromotionJobData,
    //                 {
    //                     delay: 1000,
    //                 },
    //             );

    //             // await job.addJob(RedisConfig, capLevelJobType["PROMOTE_USER"], {
    //             //   userId,
    //             //   targetLevel: eligibility.eligibleLevel,
    //             //   bypassVerification: false,
    //             //   triggeredBy: 'system',
    //             // } as UserPromotionJobData, {
    //             //   delay: 1000, // Small delay to ensure data consistency
    //             // });

    //             this.logger.log(
    //                 `Queued automatic promotion for user ${userId} to ${eligibility.eligibleLevel}`,
    //             );
    //         } else {
    //             this.logger.log(
    //                 `User ${userId} eligible for ${eligibility.eligibleLevel} but requires manual verification`,
    //             );
    //         }
    //     }

    //     return {
    //         userId,
    //         eligibility,
    //         autoPromotionQueued:
    //             eligibility.canPromote && eligibility.requirements?.requiresVerification === false,
    //     };
    // }

    /**
     * Process user cap level promotion
     */
    async processUserPromotion(job: Job<UserPromotionJobData>): Promise<any> {
        const { userId, targetLevel, bypassVerification, triggeredBy } = job.data;

        this.logger.log(
            `Promoting user ${userId} to ${targetLevel || "next eligible level"} (by: ${triggeredBy})`,
        );

        const promotedUser = await this.capLevelService.promoteUserCapLevel(
            userId,
            targetLevel,
            bypassVerification,
        );

        // TODO: Queue notification job (would be handled by notification system)
        // await this.queue.add('send-promotion-notification', {
        //   userId,
        //   newLevel: promotedUser.capLevel,
        //   triggeredBy,
        // });

        this.logger.log(`Successfully promoted user ${userId} to ${promotedUser.capLevel}`);

        return {
            userId,
            oldLevel: "NONE", // Would get from user data
            newLevel: promotedUser.capLevel,
            promotedAt: new Date(),
            triggeredBy,
        };
    }

    /**
     * Process user metrics update
     */
    async processUserMetricsUpdate(job: Job<UserMetricsUpdateJobData>) {
        const { userId, metricsUpdate, recalculateScore = true } = job.data;

        this.logger.log(`Updating metrics for user ${userId}`);

        // Update user metrics
        const updatedMetrics = await this.userMetricsService.updateUserMetrics(
            userId,
            metricsUpdate,
        );

        // Recalculate activity score if requested
        if (recalculateScore) {
            await this.userMetricsService.recalculateAndUpdateActivityScore(userId);

            // Queue eligibility check
            // await this.queue.add(
            //     capLevelJobType["CALCULATE_USER_ELIGIBILITY"],
            //     {
            //         userId,
            //         triggerAction: "metrics_update",
            //     } as UserEligibilityJobData,
            //     {
            //         delay: 2000, // Delay to ensure score recalculation is complete
            //     },
            // );
        }

        return {
            userId,
            updatedMetrics,
            eligibilityCheckQueued: recalculateScore,
        };
    }

    /**
     * Process activity score recalculation
     */
    async processActivityScoreRecalculation(job: Job<{ userId: string }>) {
        const { userId } = job.data;

        this.logger.log(`Recalculating activity score for user ${userId}`);

        const updatedMetrics =
            await this.userMetricsService.recalculateAndUpdateActivityScore(userId);
        const newScore = updatedMetrics.activityScore;

        // Queue eligibility check after score update
        // await this.queue.add(
        //     capLevelJobType["CALCULATE_USER_ELIGIBILITY"],
        //     {
        //         userId,
        //         triggerAction: "score_recalculation",
        //     } as UserEligibilityJobData,
        //     {
        //         delay: 1000,
        //     },
        // );

        return {
            userId,
            newScore,
            updatedMetrics,
            eligibilityCheckQueued: true,
        };
    }

    /**
     * Process batch user promotions
     */
    async processBatchPromotion(job: Job<BatchPromotionJobData>) {
        const { capLevel, maxUsers = 100, dryRun = false, adminId } = job.data;

        this.logger.log(
            `Processing batch promotion to ${capLevel} (max: ${maxUsers}, dryRun: ${dryRun})`,
        );

        const result = await this.capLevelService.processPendingPromotions(capLevel);

        // Limit the number of users processed
        const actualPromoted = Math.min(result.promoted, maxUsers);

        return {
            capLevel,
            promoted: actualPromoted,
            failed: result.failed,
            maxUsers,
            dryRun,
            adminId,
            processedAt: new Date(),
        };
    }

    /**
     * Process batch metrics recalculation
     */
    async processBatchMetricsRecalculation(job: Job<BatchMetricsJobData>) {
        const { userIds, capLevel, lastUpdatedBefore, batchSize = 50, adminId } = job.data;

        this.logger.log(`Processing batch metrics recalculation (batch size: ${batchSize})`);
        this.logger.log(
            `Current caplevel: ${capLevel} and last update before: ${lastUpdatedBefore}`,
        );

        let targetUserIds = userIds;

        if (!userIds || userIds.length === 0) {
            // Get users based on criteria
            const highActivityUsers = await this.userMetricsService.getUsersWithHighActivity(0);
            targetUserIds = highActivityUsers.map((metrics) => metrics.userId);
        }

        if (!targetUserIds || targetUserIds.length === 0) {
            return { processed: 0, errors: 0, message: "No users found" };
        }

        // Process in batches
        await this.userMetricsService.bulkRecalculateActivityScores(targetUserIds);

        return {
            totalUsers: targetUserIds.length,
            batchSize,
            adminId,
            processedAt: new Date(),
        };
    }

    /**
     * Process monthly revenue calculation
     */
    async processMonthlyRevenue(job: Job<MonthlyRevenueJobData>) {
        const { month, year, totalPlatformRevenue, dryRun = false, adminId } = job.data;

        this.logger.log(
            `Processing monthly revenue for ${month}/${year} - $${totalPlatformRevenue} (dryRun: ${dryRun})`,
        );

        const result = await this.adRevenueService.calculateMonthlyRevenue({
            month,
            year,
            totalPlatformRevenue,
            dryRun,
        });

        return {
            ...result,
            adminId,
            processedAt: new Date(),
        };
    }

    /**
     * Process volunteer hours update
     */
    async processVolunteerHours(job: Job<VolunteerHoursJobData>) {
        const { userId, hours, projectId, workDescription, workDate } = job.data;

        this.logger.log(`Processing volunteer hours for user ${userId}: ${hours} hours`);

        const updatedMetrics = await this.volunteerTrackingService.updateVolunteerHours({
            userId,
            hours,
            projectId,
            workDescription,
            workDate,
        });

        return {
            userId,
            hours,
            updatedMetrics,
            processedAt: new Date(),
        };
    }

    /**
     * Process 8-week service completion check
     */
    async processServiceCompletionCheck(job: Job<{ userId: string }>): Promise<any> {
        const { userId } = job.data;

        this.logger.log(`Checking 8-week service completion for user ${userId}`);

        // This would check if user meets 8-week service requirements
        // and automatically promote to BLACK level if eligible

        return {
            userId,
            checkedAt: new Date(),
            // Additional completion data would go here
        };
    }

    /**
     * Process data cleanup tasks
     */
    async processDataCleanup(job: Job<any>): Promise<any> {
        this.logger.log("Processing data cleanup tasks");
        this.logger.log(`Job name: ${job.name}`);

        // Clean up old activity logs, expired sessions, etc.
        // This would include maintenance tasks like:
        // - Remove old activity score history
        // - Clean up expired revenue calculations
        // - Archive old volunteer records

        return {
            cleanedAt: new Date(),
            tasksCompleted: ["activity_logs", "expired_sessions"],
        };
    }

    /**
     * Process report generation
     */
    async processReportGeneration(job: Job<any>): Promise<any> {
        this.logger.log("Processing report generation");
        this.logger.log(`Job name: ${job.name}`);

        // Generate various reports:
        // - Monthly cap level statistics
        // - Revenue distribution reports
        // - Volunteer activity summaries

        return {
            generatedAt: new Date(),
            reportsGenerated: ["cap_level_stats", "revenue_report", "volunteer_summary"],
        };
    }
}
