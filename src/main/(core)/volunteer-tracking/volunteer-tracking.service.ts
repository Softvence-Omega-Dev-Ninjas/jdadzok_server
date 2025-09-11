import { PrismaService } from "@lib/prisma/prisma.service";
import { UserMetricsService } from "@module/(users)/profile-metrics/user-metrics.service";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { UserMetrics, VolunteerApplication } from "@prisma/client";
import { CapLevelService } from "../cap-level/cap-lavel.service";
import {
  BatchVolunteerHoursUpdateDto,
  PlatformVolunteerStatsDto,
  ProjectCompletionDto,
  ProjectVolunteerStatsDto,
  ServiceCompletionDto,
  UpdateApplicationStatusDto,
  UpdateVolunteerHoursDto,
  UserVolunteerSummaryDto,
} from "../cap-level/dto/cap-leve.dto";

/**
 * Interface for 8-week service completion tracking
 */
interface ServiceCompletionRecord {
  userId: string;
  startDate: Date;
  endDate: Date;
  totalHours: number;
  weeksActive: number;
  completedProjects: string[];
  isCompleted: boolean;
  completedAt?: Date;
}

/**
 * Service for managing volunteer applications, tracking hours, and service completion
 * Handles all aspects of volunteer activity tracking and cap level progression
 */
@Injectable()
export class VolunteerTrackingService {
  private readonly logger = new Logger(VolunteerTrackingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userMetricsService: UserMetricsService,
    private readonly capLevelService: CapLevelService,
  ) {}

  /**
   * Updates volunteer hours for a user
   * @param updateDto Volunteer hours update data
   * @returns Updated user metrics
   */
  async updateVolunteerHours(
    updateDto: UpdateVolunteerHoursDto,
  ): Promise<UserMetrics> {
    const { userId, hours, projectId, workDescription, workDate } = updateDto;

    try {
      // Validate user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { metrics: true },
      });

      if (!user) {
        throw new BadRequestException("User not found");
      }

      // Validate project if provided
      if (projectId) {
        const project = await this.prisma.volunteerProject.findUnique({
          where: { id: projectId },
        });

        if (!project) {
          throw new BadRequestException("Volunteer project not found");
        }

        // Check if user has accepted application for this project
        const application = await this.prisma.volunteerApplication.findUnique({
          where: {
            userId_projectId: { userId, projectId },
          },
        });

        if (!application || application.status !== "ACCEPTED") {
          throw new BadRequestException(
            "User must have an accepted application for this project to log hours",
          );
        }
      }

      // Update volunteer hours in user metrics
      const updatedMetrics = await this.userMetricsService.updateVolunteerHours(
        userId,
        hours,
      );

      // Recalculate activity score (volunteer hours contribute significantly)
      await this.userMetricsService.recalculateAndUpdateActivityScore(userId);

      // Check if user is now eligible for cap level promotion
      await this.checkCapLevelEligibilityAfterVolunteerUpdate(userId);

      // Log the volunteer work
      await this.logVolunteerActivity(
        userId,
        hours,
        projectId,
        workDescription,
        workDate,
      );

      this.logger.log(
        `Updated volunteer hours for user ${userId}: +${hours} hours${projectId ? ` for project ${projectId}` : ""}`,
      );

      return updatedMetrics;
    } catch (error) {
      this.logger.error(
        `Failed to update volunteer hours: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Updates volunteer application status
   * @param applicationId Application ID
   * @param updateDto Status update data
   * @returns Updated application
   */
  async updateApplicationStatus(
    applicationId: string,
    updateDto: UpdateApplicationStatusDto,
  ): Promise<VolunteerApplication> {
    const { status, adminComment, adminId } = updateDto;

    try {
      // Validate application exists
      const application = await this.prisma.volunteerApplication.findUnique({
        where: { id: applicationId },
        include: {
          user: true,
          project: true,
        },
      });

      if (!application) {
        throw new BadRequestException("Volunteer application not found");
      }

      // Validate admin exists
      const admin = await this.prisma.user.findUnique({
        where: { id: adminId },
      });

      if (!admin) {
        throw new BadRequestException("Admin user not found");
      }

      // Update application status
      const updatedApplication = await this.prisma.volunteerApplication.update({
        where: { id: applicationId },
        data: {
          status,
          updatedAt: new Date(),
        },
      });

      // Log the status change with admin comment
      this.logger.log(
        `Application ${applicationId} status updated to ${status} by admin ${adminId}${
          adminComment ? `. Comment: ${adminComment}` : ""
        }`,
      );

      // If accepted, increment completed projects count for eventual metrics
      if (status === "ACCEPTED") {
        await this.handleApplicationAcceptance(
          application.userId,
          application.projectId,
        );
      }

      return updatedApplication;
    } catch (error) {
      this.logger.error(
        `Failed to update application status: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Marks a volunteer project as completed by a user
   * @param completionDto Project completion data
   * @returns Success confirmation
   */
  async completeVolunteerProject(completionDto: ProjectCompletionDto): Promise<{
    success: boolean;
    completedProjectsCount: number;
    totalVolunteerHours: number;
  }> {
    const {
      projectId,
      userId,
      totalHours,
      completionNotes,
      // certificateUrl,
      verifiedBy,
    } = completionDto;

    try {
      // Validate all entities exist
      const [user, project, verifier] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: userId },
          include: { metrics: true },
        }),
        this.prisma.volunteerProject.findUnique({ where: { id: projectId } }),
        this.prisma.user.findUnique({ where: { id: verifiedBy } }),
      ]);

      if (!user) throw new BadRequestException("User not found");
      if (!project) throw new BadRequestException("Project not found");
      if (!verifier) throw new BadRequestException("Verifier not found");

      // Check if user has accepted application
      const application = await this.prisma.volunteerApplication.findUnique({
        where: {
          userId_projectId: { userId, projectId },
        },
      });

      if (!application || application.status !== "ACCEPTED") {
        throw new BadRequestException(
          "User must have accepted application to complete project",
        );
      }

      // Use transaction to ensure data consistency
      const result = await this.prisma.$transaction(async (tx) => {
        // Update user metrics with project completion
        const updatedMetrics = await tx.userMetrics.update({
          where: { userId },
          data: {
            completedProjects: { increment: 1 },
            volunteerHours: { increment: totalHours },
          },
        });

        // Recalculate activity score
        await this.userMetricsService.recalculateAndUpdateActivityScore(userId);

        // Log completion activity
        await this.logProjectCompletion(
          userId,
          projectId,
          totalHours,
          completionNotes,
          verifiedBy,
        );

        return {
          completedProjectsCount: updatedMetrics.completedProjects,
          totalVolunteerHours: updatedMetrics.volunteerHours,
        };
      });

      // Check for cap level eligibility and 8-week service completion
      await this.checkCapLevelEligibilityAfterVolunteerUpdate(userId);
      await this.check8WeekServiceCompletion(userId);

      this.logger.log(
        `Project ${projectId} completed by user ${userId} with ${totalHours} hours (verified by ${verifiedBy})`,
      );

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      this.logger.error(
        `Failed to complete volunteer project: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Verifies 8-week service completion for BLACK cap level
   * @param serviceDto Service completion data
   * @returns Service completion record
   */
  async verifyServiceCompletion(
    serviceDto: ServiceCompletionDto,
  ): Promise<ServiceCompletionRecord> {
    const {
      userId,
      totalHours,
      weeksActive,
      completedProjectIds,
      serviceSummary,
      verifiedBy,
      serviceStartDate,
      serviceEndDate,
    } = serviceDto;

    try {
      // Validate user and verifier
      const [user, verifier] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: userId },
          include: { metrics: true },
        }),
        this.prisma.user.findUnique({ where: { id: verifiedBy } }),
      ]);

      if (!user) throw new BadRequestException("User not found");
      if (!verifier) throw new BadRequestException("Verifier not found");

      // Validate completed projects
      const projects = await this.prisma.volunteerProject.findMany({
        where: { id: { in: completedProjectIds } },
      });

      if (projects.length !== completedProjectIds.length) {
        throw new BadRequestException("One or more project IDs are invalid");
      }

      // Validate service duration and requirements
      const startDate = new Date(serviceStartDate);
      const endDate = new Date(serviceEndDate);
      const actualWeeks = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7),
      );

      if (actualWeeks < 8) {
        throw new BadRequestException(
          "Service period must be at least 8 weeks",
        );
      }

      if (totalHours < 200) {
        throw new BadRequestException(
          "Minimum 200 volunteer hours required for 8-week service completion",
        );
      }

      if (weeksActive < 8) {
        throw new BadRequestException("Must be active for at least 8 weeks");
      }

      // Create service completion record
      const serviceRecord: ServiceCompletionRecord = {
        userId,
        startDate,
        endDate,
        totalHours,
        weeksActive,
        completedProjects: completedProjectIds,
        isCompleted: true,
        completedAt: new Date(),
      };

      // Store completion record (you might want to create a separate table for this)
      await this.storeServiceCompletionRecord(
        serviceRecord,
        verifiedBy,
        serviceSummary,
      );

      // Automatically promote user to BLACK cap level if eligible
      await this.promoteToBlackCapLevel(userId);

      this.logger.log(
        `8-week service completion verified for user ${userId}: ${totalHours} hours over ${weeksActive} weeks`,
      );

      return serviceRecord;
    } catch (error) {
      this.logger.error(
        `Failed to verify service completion: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Gets comprehensive volunteer summary for a user
   * @param userId User ID
   * @returns User volunteer summary with analytics
   */
  async getUserVolunteerSummary(
    userId: string,
  ): Promise<UserVolunteerSummaryDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          metrics: true,
          volunteerApps: {
            include: { project: true },
            orderBy: { updatedAt: "desc" },
          },
        },
      });

      if (!user || !user.metrics) {
        throw new BadRequestException("User or user metrics not found");
      }

      const metrics = user.metrics;

      // Calculate average hours per project
      const averageHoursPerProject =
        metrics.completedProjects > 0
          ? metrics.volunteerHours / metrics.completedProjects
          : 0;

      // Count active applications
      const activeApplications = user.volunteerApps.filter(
        (app) => app.status === "ACCEPTED",
      ).length;

      // Calculate weeks active (simplified - based on first and last activity)
      const weeksActive = await this.calculateUserWeeksActive(userId);

      // Check 8-week service completion
      const hasCompleted8WeekService =
        await this.hasUserCompleted8WeekService(userId);
      const serviceCompletionDate = hasCompleted8WeekService
        ? await this.getServiceCompletionDate(userId)
        : undefined;

      // Get volunteer rank
      const volunteerRank = await this.getUserVolunteerRank(userId);

      // Get recent activities
      const recentActivities = user.volunteerApps.slice(0, 5).map((app) => ({
        projectId: app.projectId,
        projectTitle: app.project.title,
        hoursContributed: 0, // Would need to track this separately
        status: app.status,
        lastActivity: app.updatedAt,
      }));

      return {
        userId,
        totalHours: metrics.volunteerHours,
        completedProjects: metrics.completedProjects,
        activeApplications,
        averageHoursPerProject,
        weeksActive,
        hasCompleted8WeekService,
        serviceCompletionDate,
        volunteerRank,
        recentActivities,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get volunteer summary for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Gets volunteer statistics for a specific project
   * @param projectId Project ID
   * @returns Project volunteer statistics
   */
  async getProjectVolunteerStats(
    projectId: string,
  ): Promise<ProjectVolunteerStatsDto> {
    try {
      const project = await this.prisma.volunteerProject.findUnique({
        where: { id: projectId },
        include: {
          applications: {
            include: { user: { include: { metrics: true } } },
          },
        },
      });

      if (!project) {
        throw new BadRequestException("Project not found");
      }

      const applications = project.applications;
      const totalApplications = applications.length;
      const acceptedApplications = applications.filter(
        (app) => app.status === "ACCEPTED",
      ).length;

      // Calculate total volunteer hours (would need separate tracking table)
      const totalVolunteerHours = applications
        .filter((app) => app.status === "ACCEPTED")
        .reduce((sum, app) => sum + (app.user.metrics?.volunteerHours || 0), 0);

      const activeVolunteers = applications.filter(
        (app) => app.status === "ACCEPTED",
      ).length;
      const completionRate =
        totalApplications > 0
          ? (acceptedApplications / totalApplications) * 100
          : 0;
      const averageHoursPerVolunteer =
        activeVolunteers > 0 ? totalVolunteerHours / activeVolunteers : 0;

      return {
        projectId,
        projectTitle: project.title,
        totalApplications,
        acceptedApplications,
        totalVolunteerHours,
        activeVolunteers,
        completionRate,
        averageHoursPerVolunteer,
        projectStatus: project.status,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get project volunteer stats: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Gets volunteer leaderboard
   * @param limit Number of top volunteers to return
   * @returns Volunteer leaderboard
   */
  async getVolunteerLeaderboard(limit: number = 50) {
    try {
      const topVolunteers = await this.prisma.user.findMany({
        where: {
          metrics: { isNot: null },
        },
        include: {
          metrics: true,
          profile: true,
        },
        orderBy: {
          metrics: {
            volunteerHours: "desc",
          },
        },
        take: limit,
      });

      return topVolunteers.map((user, index) => ({
        rank: index + 1,
        userId: user.id,
        displayName: user.profile?.name,
        totalHours: user.metrics?.volunteerHours || 0,
        completedProjects: user.metrics?.completedProjects || 0,
        capLevel: user.capLevel,
        hasCompleted8WeekService: false, // Would check service completion table
        weeksActive: 0, // Would calculate from activity logs
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get volunteer leaderboard: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Gets platform-wide volunteer statistics
   * @returns Comprehensive platform volunteer analytics
   */
  async getPlatformVolunteerStats(): Promise<PlatformVolunteerStatsDto> {
    try {
      // Get basic counts
      const [totalVolunteers, totalCompletedProjects] = await Promise.all([
        this.prisma.user.count({
          where: {
            volunteerApps: { some: {} },
          },
        }),
        this.prisma.volunteerProject.count({
          where: { status: "COMPLETED" },
        }),
      ]);

      // Get active volunteers (volunteered in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeVolunteers = await this.prisma.user.count({
        where: {
          metrics: {
            lastUpdated: { gte: thirtyDaysAgo },
            volunteerHours: { gt: 0 },
          },
        },
      });

      // Get total volunteer hours
      const totalHoursResult = await this.prisma.userMetrics.aggregate({
        _sum: { volunteerHours: true },
      });
      const totalHours = totalHoursResult._sum.volunteerHours || 0;

      // Users who completed 8-week service (would need service completion table)
      const usersCompleted8WeekService = 0; // Placeholder

      const averageHoursPerUser =
        totalVolunteers > 0 ? totalHours / totalVolunteers : 0;

      // Monthly trend (simplified)
      const monthlyTrend = await this.getVolunteerMonthlyTrend();

      // Volunteers by cap level
      const volunteersByCapLevel = await this.getVolunteersByCapLevel();

      return {
        totalVolunteers,
        activeVolunteers,
        totalHours,
        totalCompletedProjects,
        usersCompleted8WeekService,
        averageHoursPerUser,
        monthlyTrend,
        volunteersByCapLevel,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get platform volunteer stats: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Processes batch volunteer hours update
   * @param batchDto Batch update data
   * @returns Batch processing results
   */
  async processBatchVolunteerHoursUpdate(
    batchDto: BatchVolunteerHoursUpdateDto,
  ): Promise<{
    successful: number;
    failed: number;
    errors: string[];
  }> {
    const { updates, adminId, batchNotes } = batchDto;
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      this.logger.log(
        `Starting batch volunteer hours update for ${updates.length} users by admin ${adminId}`,
      );

      for (const update of updates) {
        try {
          await this.updateVolunteerHours(update);
          successful++;
        } catch (error) {
          failed++;
          errors.push(`User ${update.userId}: ${error.message}`);
          this.logger.error(
            `Failed to update hours for user ${update.userId}: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `Batch volunteer hours update completed: ${successful} successful, ${failed} failed${
          batchNotes ? `. Notes: ${batchNotes}` : ""
        }`,
      );

      return { successful, failed, errors };
    } catch (error) {
      this.logger.error(
        `Batch volunteer hours update failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Private helper methods

  /**
   * Checks cap level eligibility after volunteer activity update
   */
  private async checkCapLevelEligibilityAfterVolunteerUpdate(
    userId: string,
  ): Promise<void> {
    try {
      const eligibility =
        await this.capLevelService.calculateCapEligibility(userId);

      if (eligibility.canPromote) {
        // Auto-promote for GREEN/YELLOW levels (no admin verification needed)
        const requirements = await this.prisma.capRequirements.findUnique({
          where: { capLevel: eligibility.eligibleLevel },
        });

        if (
          requirements &&
          !requirements.requiresVerification &&
          !requirements.requiresNomination
        ) {
          await this.capLevelService.promoteUserCapLevel(
            userId,
            eligibility.eligibleLevel,
            false,
          );
          this.logger.log(
            `Auto-promoted user ${userId} to ${eligibility.eligibleLevel} after volunteer activity`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to check cap level eligibility: ${error.message}`,
      );
    }
  }

  /**
   * Checks if user has completed 8-week service requirement
   */
  private async check8WeekServiceCompletion(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { metrics: true },
    });

    if (!user?.metrics) return;

    // Check if user has enough volunteer hours and projects for 8-week service
    if (
      user.metrics.volunteerHours >= 200 &&
      user.metrics.completedProjects >= 3
    ) {
      // This is a simplified check - in practice, you'd verify actual 8-week period
      this.logger.log(
        `User ${userId} may be eligible for 8-week service completion verification`,
      );
    }
  }

  /**
   * Handles application acceptance
   */
  private async handleApplicationAcceptance(
    userId: string,
    projectId: string,
  ): Promise<void> {
    // Log application acceptance - could trigger notifications here
    this.logger.log(
      `User ${userId} application accepted for project ${projectId}`,
    );
  }

  /**
   * Logs volunteer activity for tracking
   */
  private async logVolunteerActivity(
    userId: string,
    hours: number,
    projectId?: string,
    description?: string,
    workDate?: string,
  ): Promise<void> {
    // In a real implementation, you'd store this in a volunteer activity log table
    this.logger.log(
      `Volunteer activity logged - User: ${userId}, Hours: ${hours}, Project: ${projectId || "N/A"}, Date: ${
        workDate || "Today"
      }`,
    );
  }

  /**
   * Logs project completion
   */
  private async logProjectCompletion(
    userId: string,
    projectId: string,
    hours: number,
    notes?: string,
    verifiedBy?: string,
  ): Promise<void> {
    this.logger.log(
      `Project completion logged - User: ${userId}, Project: ${projectId}, Hours: ${hours}, Verifier: ${verifiedBy}`,
    );
  }

  /**
   * Stores service completion record
   */
  private async storeServiceCompletionRecord(
    record: ServiceCompletionRecord,
    verifiedBy: string,
    summary?: string,
  ) {
    // In a real implementation, you'd store this in a service completion table
    this.logger.log(
      `Service completion recorded - User: ${record.userId}, Hours: ${record.totalHours}, Weeks: ${record.weeksActive}`,
    );
    return { verifiedBy, summary };
  }

  /**
   * Promotes user to BLACK cap level after 8-week service completion
   */
  private async promoteToBlackCapLevel(userId: string): Promise<void> {
    try {
      await this.capLevelService.promoteUserCapLevel(userId, "BLACK", true); // Bypass verification for completed service
      this.logger.log(
        `User ${userId} promoted to BLACK cap level after 8-week service completion`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to promote user ${userId} to BLACK cap level: ${error.message}`,
      );
    }
  }

  /**
   * Helper methods for statistics
   */
  private async getUserVolunteerRank(userId: string): Promise<number> {
    const userMetrics = await this.prisma.userMetrics.findUnique({
      where: { userId },
    });
    if (!userMetrics) return 0;

    const usersWithMoreHours = await this.prisma.userMetrics.count({
      where: {
        volunteerHours: { gt: userMetrics.volunteerHours },
      },
    });

    return usersWithMoreHours + 1;
  }

  private async calculateUserWeeksActive(userId: string): Promise<number> {
    console.info(userId);
    // Simplified calculation - would use activity logs in real implementation
    return 4; // Placeholder
  }

  private async hasUserCompleted8WeekService(userId: string): Promise<boolean> {
    console.info(userId);
    // Check service completion table - placeholder
    return false;
  }

  private async getServiceCompletionDate(
    userId: string,
  ): Promise<Date | undefined> {
    // Get from service completion table - placeholder
    console.info(userId);
    return undefined;
  }

  private async getVolunteerMonthlyTrend(): Promise<
    Array<{
      month: number;
      year: number;
      totalHours: number;
      activeVolunteers: number;
      newApplications: number;
      completedProjects: number;
    }>
  > {
    // Simplified trend calculation - would use proper date aggregation
    return [];
  }

  private async getVolunteersByCapLevel(): Promise<
    Record<
      string,
      {
        count: number;
        averageHours: number;
        completionRate: number;
      }
    >
  > {
    const stats = await this.prisma.user.groupBy({
      by: ["capLevel"],
      where: {
        metrics: { isNot: null },
        volunteerApps: { some: {} },
      },
      _count: { capLevel: true },
    });

    const result: Record<
      string,
      { count: number; averageHours: number; completionRate: number }
    > = {};

    for (const stat of stats) {
      result[stat.capLevel] = {
        count: stat._count.capLevel,
        averageHours: 0,
        completionRate: 80, // Placeholder - would calculate from completion data
      };
    }

    return result;
  }
}
