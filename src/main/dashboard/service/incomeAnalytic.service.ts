import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

import { PayOutStatus, OrderStatus } from "@prisma/client";

@Injectable()
export class IncomeAnalyticService {
    constructor(private readonly prisma: PrismaService) {}

    async getOverview() {
        const now = new Date();

        const startThisMonth = startOfMonth(now);
        const startLastMonth = startOfMonth(subMonths(now, 1));
        const endLastMonth = endOfMonth(subMonths(now, 1));

        /* ====== 1️⃣ PROMOTION FEE (Your Original Code) ====== */

        const promoThisMonthAgg = await this.prisma.product.aggregate({
            where: { createdAt: { gte: startThisMonth } },
            _sum: { promotionFee: true },
        });

        const promoPrevMonthAgg = await this.prisma.product.aggregate({
            where: { createdAt: { gte: startLastMonth, lte: endLastMonth } },
            _sum: { promotionFee: true },
        });

        const promoThisMonth = promoThisMonthAgg._sum?.promotionFee ?? 0;
        const promoPrevMonth = promoPrevMonthAgg._sum?.promotionFee ?? 0;

        const revenueIncreasePercent =
            promoPrevMonth === 0 ? 100 : ((promoThisMonth - promoPrevMonth) / promoPrevMonth) * 100;

        const commisionIncreasePercent = revenueIncreasePercent;

        const stripePaidAgg = await this.prisma.payout.aggregate({
            _sum: { amount: true },
            where: { status: PayOutStatus.PAID }, // FIXED ENUM
        });

        const sellerPayouts = stripePaidAgg._sum?.amount ?? 0;

        const pendingAgg = await this.prisma.sellerEarnings.aggregate({
            _sum: { pending: true },
        });

        const pendingPayouts = pendingAgg._sum?.pending ?? 0;

        const aovThisMonthAgg = await this.prisma.order.aggregate({
            _avg: { totalPrice: true },
            where: {
                createdAt: { gte: startThisMonth },
                status: OrderStatus.PENDING,
            },
        });

        const avgOrderValue = aovThisMonthAgg._avg?.totalPrice ?? 0;

        const aovLastMonthAgg = await this.prisma.order.aggregate({
            _avg: { totalPrice: true },
            where: {
                createdAt: { gte: startLastMonth, lte: endLastMonth },
                status: OrderStatus.PENDING,
            },
        });

        const aovLastMonth = aovLastMonthAgg._avg?.totalPrice ?? 0;

        const avgOrderIncreasePercent =
            aovLastMonth === 0 ? 100 : ((avgOrderValue - aovLastMonth) / aovLastMonth) * 100;

        return {
            // Revenue
            totalRevenue: promoThisMonth,
            revenueIncreasePercent,
            platformCommision: promoThisMonth,
            commisionIncreasePercent,
            sellerPayouts,
            pendingPayouts,
            avgOrderValue,
            avgOrderIncreasePercent,
        };
    }

    async getRevenueGrowth() {
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

    async getRevenueCategory() {
        const volunteer = await this.prisma.volunteerProject.count();
        const promotions = await this.prisma.product.count({
            where: { promotionFee: { gt: 0 } },
        });
        const donations = 0;
        const total = volunteer + promotions + donations;

        return {
            volunteerProjects: total ? Math.round((volunteer / total) * 100) : 0,
            marketplacePromotions: total ? Math.round((promotions / total) * 100) : 0,
            donations: total ? Math.round((donations / total) * 100) : 0,
        };
    }

    async getTopSellers() {
        const products = await this.prisma.product.findMany({
            include: {
                seller: {
                    include: { profile: true },
                },
                orders: true,
            },
        });

        const sellerMap: Record<
            string,
            {
                sellerId: string;
                sellerName: string | null;
                totalOrders: number;
                totalRevenue: number;
                totalCommission: number;
            }
        > = {};

        for (const product of products) {
            const sellerId = product.sellerId;
            const sellerName = product.seller?.profile?.name ?? null;

            if (!sellerMap[sellerId]) {
                sellerMap[sellerId] = {
                    sellerId,
                    sellerName,
                    totalOrders: 0,
                    totalRevenue: 0,
                    totalCommission: 0,
                };
            }

            const orders = product.orders;
            const totalOrders = orders.length;
            const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
            const totalCommission = (product.promotionFee || 0) * totalOrders;

            sellerMap[sellerId].totalOrders += totalOrders;
            sellerMap[sellerId].totalRevenue += totalRevenue;
            sellerMap[sellerId].totalCommission += totalCommission;
        }

        const topSellers = Object.values(sellerMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

        return {
            status: "success",
            message: "Top sellers fetched",
            data: topSellers,
        };
    }
}
