import { CapLevel } from "@constants/enums";

/**
 * Job data interfaces
 */
export type UserEligibilityJobData = {
  userId: string;
  triggerAction?: string; // What action triggered this check
};

export type UserPromotionJobData = {
  userId: string;
  targetLevel?: CapLevel;
  bypassVerification?: boolean;
  triggeredBy?: string; // admin ID or 'system'
};

export type UserMetricsUpdateJobData = {
  userId: string;
  metricsUpdate: {
    totalPosts?: number;
    totalComments?: number;
    totalLikes?: number;
    totalShares?: number;
    totalFollowers?: number;
    volunteerHours?: number;
    completedProjects?: number;
  };
  recalculateScore?: boolean;
};

export type BatchPromotionJobData = {
  capLevel: CapLevel;
  maxUsers?: number;
  dryRun?: boolean;
  adminId?: string;
};

export type MonthlyRevenueJobData = {
  month: number;
  year: number;
  totalPlatformRevenue: number;
  dryRun?: boolean;
  adminId?: string;
};

export type VolunteerHoursJobData = {
  userId: string;
  hours: number;
  projectId?: string;
  workDescription?: string;
  workDate?: string;
};

export type BatchMetricsJobData = {
  userIds?: string[];
  capLevel?: CapLevel;
  lastUpdatedBefore?: string;
  batchSize?: number;
  adminId?: string;
};
