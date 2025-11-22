import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PayoutManagementService {
    constructor(private prisma: PrismaService) {}

    async getSummary() {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalPending = await this.prisma.order.count({
            where: { status: "PENDING" },
        });

        const totalPaid = await this.prisma.order.count({
            where: { status: "PAID" },
        });

        const paidThisMonth = await this.prisma.order.aggregate({
            where: {
                status: "PAID",
                updatedAt: { gte: monthStart },
            },
            _sum: { totalPrice: true },
        });

        const totalAmount = await this.prisma.order.aggregate({
            where: {
                status: { in: ["PENDING", "PAID"] },
            },
            _sum: { totalPrice: true },
        });

        return {
            totalPending,
            totalPaid,
            paidThisMonth: paidThisMonth._sum.totalPrice || 0,
            paidTotalAmount: totalAmount._sum.totalPrice || 0,
        };
    }
}
