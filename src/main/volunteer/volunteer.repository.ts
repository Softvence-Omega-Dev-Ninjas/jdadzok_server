import { PrismaService } from "@lib/prisma/prisma.service";
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { CreateVolunteerProjectDto } from "./dto/volunteer.dto";

@Injectable()
export class VolunteerRepository {
    constructor(private readonly prisma: PrismaService) {}
    /**
     * Create a volunteer project
     */
    async createProject(createdById: string, data: CreateVolunteerProjectDto) {
        return await this.prisma.volunteerProject.create({
            data: {
                createdById,
                title: data.title,
                description: data.description,
                location: data.location,
                remoteAllowed: data.remoteAllowed || false,
                requiredSkills: data.requiredSkills,
                timeCommitment: data.timeCommitment,
                duration: data.duration,
                status: "OPEN",
            },
            include: {
                createdBy: { include: { profile: true } },
                _count: { select: { applications: true } },
            },
        });
    }

    /**
     * Apply to a volunteer project
     */
    async applyToProject(userId: string, projectId: string, coverLetter?: string) {
        // Check if already applied
        const existingApplication = await this.prisma.volunteerApplication.findUnique({
            where: {
                userId_projectId: { userId, projectId },
            },
        });

        if (existingApplication) {
            throw new BadRequestException("Already applied to this project");
        }

        return await this.prisma.volunteerApplication.create({
            data: {
                userId,
                projectId,
                coverLetter,
                status: "PENDING",
                availableStartDate: new Date(),
            },
            include: {
                user: { include: { profile: true } },
                project: {
                    include: {
                        createdBy: { include: { profile: true } },
                    },
                },
            },
        });
    }

    /**
     * Accept/Reject volunteer application
     */
    async updateApplicationStatus(
        applicationId: string,
        status: "ACCEPTED" | "REJECTED",
        reviewerId: string,
    ) {
        const application = await this.prisma.volunteerApplication.findUnique({
            where: { id: applicationId },
            include: { project: true, user: true },
        });

        if (!application) {
            throw new NotFoundException("Application not found");
        }

        // Check if reviewer has permission
        if (application.project.createdById !== reviewerId) {
            throw new ForbiddenException("Not authorized to review this application");
        }

        return await this.prisma.$transaction(async (prisma) => {
            const updatedApplication = await prisma.volunteerApplication.update({
                where: { id: applicationId },
                data: { status },
                include: {
                    user: { include: { profile: true } },
                    project: true,
                },
            });

            // Create notification for applicant
            await prisma.notification.create({
                data: {
                    userId: application.userId,
                    type: "VOLUNTEER_MATCH",
                    title: `Application ${status.toLowerCase()}`,
                    message: `Your application for "${application.project.title}" has been ${status.toLowerCase()}`,
                    entityId: applicationId,
                },
            });

            // If accepted, award activity points
            if (status === "ACCEPTED") {
                await this.updateUserActivityScore(application.userId, 50); // 50 points for accepted application
            }

            return updatedApplication;
        });
    }

    /**
     * Complete volunteer service (for Black Cap qualification)
     */
    async completeVolunteerService(applicationId: string, hoursCompleted: number) {
        const application = await this.prisma.volunteerApplication.findUnique({
            where: { id: applicationId },
            include: { user: true },
        });

        if (!application) {
            throw new NotFoundException("Application not found");
        }

        if (application.status !== "ACCEPTED") {
            throw new BadRequestException("Application must be accepted to complete service");
        }

        return await this.prisma.$transaction(async (prisma) => {
            // Update user metrics
            await prisma.userMetrics.update({
                where: { userId: application.userId },
                data: {
                    volunteerHours: { increment: hoursCompleted },
                    completedProjects: { increment: 1 },
                    activityScore: { increment: hoursCompleted * 2 }, // 2 points per hour
                },
            });

            // Check if user qualifies for Black Cap (8 weeks = ~320 hours minimum)
            const userMetrics = await prisma.userMetrics.findUnique({
                where: { userId: application.userId },
            });

            if (userMetrics && userMetrics.volunteerHours >= 320) {
                await prisma.user.update({
                    where: { id: application.userId },
                    data: { capLevel: "BLACK" },
                });

                // Create Black Cap notification
                await prisma.notification.create({
                    data: {
                        userId: application.userId,
                        type: "CAP_UPGRADE",
                        title: "Black Cap Earned! 🖤",
                        message:
                            "Congratulations! Your volunteer service has earned you the Black Cap level.",
                    },
                });
            }

            return { completed: true, hoursCompleted };
        });
    }

    /**
     * Create endorsement
     */
    async createEndorsement(
        fromUserId: string,
        toUserId: string,
        message: string,
        projectId?: string,
    ) {
        return await this.prisma.endorsement.create({
            data: {
                fromUserId,
                toUserId,
                message,
                projectId,
            },
            include: {
                fromUser: { include: { profile: true } },
                toUser: { include: { profile: true } },
                project: true,
            },
        });
    }

    private async updateUserActivityScore(userId: string, points: number) {
        await this.prisma.userMetrics.update({
            where: { userId },
            data: { activityScore: { increment: points } },
        });
    }
}
