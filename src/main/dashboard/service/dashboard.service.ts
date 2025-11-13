import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) {}

    // ----------admin dashboard user overview-------------
    async getUserOverview() {
        const now = new Date();

        // Current and previous month ranges
        const currentMonthStart = startOfMonth(now);
        const currentMonthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        // ---------- USERS ----------
        const totalUsers = await this.prisma.user.count();

        const currentMonthUsers = await this.prisma.user.count({
            where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } },
        });

        const lastMonthUsers = await this.prisma.user.count({
            where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        });

        const userGrowth =
            lastMonthUsers === 0
                ? 100
                : ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;

        // ---------- COMMUNITIES ----------
        const VerifiedCommunities = await this.prisma.community.count({
            where: { isVerified: true },
        });

        const currentMonthCommunities = await this.prisma.community.count({
            where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } },
        });

        const lastMonthCommunities = await this.prisma.community.count({
            where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        });

        const communityGrowth =
            lastMonthCommunities === 0
                ? 100
                : ((currentMonthCommunities - lastMonthCommunities) / lastMonthCommunities) * 100;

        // ---------- MARKETPLACE REVENUE ----------
        const totalRevenue =
            (
                await this.prisma.adRevenueShare.aggregate({
                    _sum: { amount: true },
                })
            )._sum.amount || 0;

        const currentMonthRevenue =
            (
                await this.prisma.adRevenueShare.aggregate({
                    _sum: {
                        amount: true,
                    },
                    where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } },
                })
            )._sum.amount || 0;

        const lastMonthRevenue =
            (
                await this.prisma.adRevenueShare.aggregate({
                    _sum: {
                        amount: true,
                    },
                    where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
                })
            )._sum.amount || 0;

        const revenueGrowth =
            lastMonthRevenue === 0
                ? 100
                : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

        // ---------- RETURN STRUCTURED DATA ----------
        return {
            users: {
                total: totalUsers,
                currentMonth: currentMonthUsers,
                lastMonth: lastMonthUsers,
                growth: +userGrowth.toFixed(2),
            },
            communities: {
                total: VerifiedCommunities,
                currentMonth: currentMonthCommunities,
                lastMonth: lastMonthCommunities,
                growth: +communityGrowth.toFixed(2),
            },
            revenue: {
                total: totalRevenue,
                currentMonth: currentMonthRevenue,
                lastMonth: lastMonthRevenue,
                growth: +revenueGrowth.toFixed(2),
            },
        };
    }

    // create(createDashboardDto: CreateDashboardDto) {
    //     return "This action adds a new dashboard";
    // }

    findAll() {
        return `This action returns all dashboard`;
    }

    findOne(id: number) {
        return `This action returns a #${id} dashboard`;
    }

    // update(id: number, updateDashboardDto: UpdateDashboardDto) {
    //     return `This action updates a #${id} dashboard`;
    // }

    remove(id: number) {
        return `This action removes a #${id} dashboard`;
    }
}
