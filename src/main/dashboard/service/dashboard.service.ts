import { PrismaService } from "@lib/prisma/prisma.service";
import { UpdateReportDto } from "@module/(users)/report/dto/report.dto";
import { Injectable } from "@nestjs/common";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) {}

    async getSummary() {
        const now = new Date();
        const startThisMonth = startOfMonth(now);
        const startLastMonth = startOfMonth(subMonths(now, 1));
        const endLastMonth = endOfMonth(subMonths(now, 1));

        const usersThisMonth = await this.prisma.user.count({
            where: { createdAt: { gte: startThisMonth } },
        });
        const usersLastMonth = await this.prisma.user.count({
            where: { createdAt: { gte: startLastMonth, lte: endLastMonth } },
        });
        const userIncreasePercent =
            usersLastMonth === 0 ? 100 : ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100;

        const totalCommunities = await this.prisma.ngo.count();
        const communitiesThisMonth = await this.prisma.ngo.count({
            where: { foundationDate: { gte: startThisMonth } },
        });
        const communitiesLastMonth = await this.prisma.ngo.count({
            where: { foundationDate: { gte: startLastMonth, lte: endLastMonth } },
        });
        const communitiesIncreasePercent =
            communitiesLastMonth === 0
                ? 100
                : ((communitiesThisMonth - communitiesLastMonth) / communitiesLastMonth) * 100;

        const activeVolunteerProjectsCount = await this.prisma.volunteerProject.count({
            where: { isActive: true },
        });
        const volunteerProjectsThisMonth = await this.prisma.volunteerProject.count({
            where: { createdAt: { gte: startThisMonth } },
        });
        const volunteerProjectsLastMonth = await this.prisma.volunteerProject.count({
            where: { createdAt: { gte: startLastMonth, lte: endLastMonth } },
        });
        const volunteerProjectsIncreasePercent =
            volunteerProjectsLastMonth === 0
                ? 100
                : ((volunteerProjectsThisMonth - volunteerProjectsLastMonth) /
                      volunteerProjectsLastMonth) *
                  100;

        const promoThisMonthAgg = await this.prisma.product.aggregate({
            where: { createdAt: { gte: startThisMonth } },
            _sum: { promotionFee: true },
        });
        const promoPrevMonthAgg = await this.prisma.product.aggregate({
            where: { createdAt: { gte: startLastMonth, lte: endLastMonth } },
            _sum: { promotionFee: true },
        });

        const promoThisMonth = promoThisMonthAgg._sum.promotionFee || 0;
        const promoPrevMonth = promoPrevMonthAgg._sum.promotionFee || 0;

        const promoIncreasePercent =
            promoPrevMonth === 0 ? 100 : ((promoThisMonth - promoPrevMonth) / promoPrevMonth) * 100;

        return {
            usersThisMonth,
            userIncreasePercent,
            totalCommunities,
            communitiesIncreasePercent,
            activeVolunteerProjectsCount,
            volunteerProjectsIncreasePercent,
            marketplacePromotionEarningsThisMonth: promoThisMonth,
            promoIncreasePercent,
        };
    }

    async getUserGrowth() {
        const data = [];

        for (let i = 5; i >= 0; i--) {
            const monthStart = startOfMonth(subMonths(new Date(), i));
            const monthEnd = endOfMonth(subMonths(new Date(), i));

            const count = await this.prisma.user.count({
                where: { createdAt: { gte: monthStart, lte: monthEnd } },
            });

            data.push({
                month: monthStart.toLocaleString("en-US", { month: "long" }),
                count,
            });
        }

        return { userGrowth: data };
    }

    async getRevenueTrends() {
        const data = [];

        for (let i = 5; i >= 0; i--) {
            const monthStart = startOfMonth(subMonths(new Date(), i));
            const monthEnd = endOfMonth(subMonths(new Date(), i));
            const total = await this.prisma.product.aggregate({
                where: {
                    createdAt: { gte: monthStart, lte: monthEnd },
                },
                _sum: {
                    promotionFee: true,
                },
            });

            data.push({
                month: monthStart.toLocaleString("en-US", { month: "long" }),
                total: total._sum.promotionFee || 0,
            });
        }

        return { revenueTrends: data };
    }

    async getActivityDivision() {
        const volunteer = await this.prisma.volunteerProject.count();
        const promotions = await this.prisma.product.count({
            where: { promotionFee: { gt: 0 } },
        });
        const donations = 0;
        const total = volunteer + promotions + donations;

        return {
            activityDivision: {
                volunteerProjects: total ? Math.round((volunteer / total) * 100) : 0,
                marketplacePromotions: total ? Math.round((promotions / total) * 100) : 0,
                donations: total ? Math.round((donations / total) * 100) : 0,
            },
        };
    }
    async getPendingApplicationsDetailed() {
        // Pending NGO verifications
        const ngoVerifications = await this.prisma.ngoVerification.findMany({
            where: { status: "PENDING" },
            select: {
                id: true,
                ngo: {
                    select: {
                        profile: { select: { title: true } }, // NGO title from profile
                    },
                },
                createdAt: true,
            },
        });

        const ngoVerificationFormatted = ngoVerifications.map((nv) => ({
            id: nv.id,
            title: nv.ngo.profile?.title || "Untitled NGO", // fallback if title missing
            applicationTime: nv.createdAt,
            type: "Ngo Verification",
        }));

        // Pending volunteer project applications
        const volunteerApplications = await this.prisma.volunteerApplication.findMany({
            where: { status: "PENDING" },
            select: {
                id: true,
                project: { select: { title: true } },
                createdAt: true,
            },
        });

        const volunteerApplicationsFormatted = volunteerApplications.map((va) => ({
            id: va.id,
            title: va.project.title,
            applicationTime: va.createdAt,
            type: "Project Verification",
        }));

        // Combine both for admin dashboard
        const pendingApplications = [
            ...ngoVerificationFormatted,
            ...volunteerApplicationsFormatted,
        ];

        // Sort by applicationTime descending
        pendingApplications.sort(
            (a, b) => b.applicationTime.getTime() - a.applicationTime.getTime(),
        );

        return pendingApplications;
    }

    async getPendingReports() {
        const reports = await this.prisma.report.findMany({
            where: { status: "PENDING" },
            orderBy: { createdAt: "desc" },
            include: {
                reporter: {
                    select: {
                        id: true,
                        profile: { select: { username: true, name: true, avatarUrl: true } },
                    },
                },
            },
        });

        // dynamically attach reported entity details
        return Promise.all(
            reports.map(async (r) => ({
                ...r,
                target: await this.resolveTarget(r.targetType, r.targetId),
            })),
        );
    }

    async reviewReport(reportId: string, dto: UpdateReportDto, adminId: string) {
        const exists = await this.prisma.report.findUnique({ where: { id: reportId } });
        if (!exists) throw new Error("Report not found");

        return this.prisma.report.update({
            where: { id: reportId },
            data: {
                status: dto.status,
                adminNotes: dto.adminNotes || null,
                reviewedById: adminId,
            },
        });
    }

    async resolveTarget(type: string, id: string) {
        switch (type) {
            case "POST":
                return this.prisma.post.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        text: true,
                        mediaUrls: true,
                        author: {
                            select: {
                                id: true,
                                profile: { select: { username: true, avatarUrl: true } },
                            },
                        },
                    },
                });

            case "PRODUCT":
                return this.prisma.product.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        seller: {
                            select: {
                                id: true,
                                profile: { select: { username: true, avatarUrl: true } },
                            },
                        },
                    },
                });

            case "USER":
                return this.prisma.user.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        profile: { select: { username: true, name: true, avatarUrl: true } },
                    },
                });

            case "COMMENT":
                return this.prisma.comment.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        text: true,
                        author: {
                            select: {
                                id: true,
                                profile: { select: { username: true, avatarUrl: true } },
                            },
                        },
                    },
                });

            default:
                return null;
        }
    }
}
