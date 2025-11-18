import { Injectable } from "@nestjs/common";
import { PrismaService } from "@lib/prisma/prisma.service";
import { OrderStatus } from "@prisma/client";
import { OrderListQueryDto } from "../dto/orderListQuery.dto";

@Injectable()
export class OrderTransactionService {
    constructor(private prisma: PrismaService) {}

    async getDashboardStats() {
        const totalOrders = await this.prisma.order.count();

        const totalRevenue = await this.prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: "SUCCEEDED" },
        });

        //  platform commission = 10% of revenue
        const commission = (totalRevenue._sum.amount || 0) * 0.1;

        const completedOrders = await this.prisma.order.count({
            where: { status: OrderStatus.PAID },
        });

        return {
            totalOrders,
            totalRevenue: totalRevenue._sum.amount || 0,
            commission: Number(commission.toFixed(2)),
            completedOrders,
            completionRate:
                totalOrders > 0 ? Number(((completedOrders / totalOrders) * 100).toFixed(1)) : 0,
        };
    }

    async listOrders(query: OrderListQueryDto) {
        const { status, search } = query;

        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : 10;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status) where.status = status;

        if (search) {
            where.OR = [
                { id: { contains: search, mode: "insensitive" } },
                {
                    buyer: {
                        profile: {
                            name: { contains: search, mode: "insensitive" },
                        },
                    },
                },
            ];
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    buyer: { include: { profile: true } },
                    product: { include: { seller: { include: { profile: true } } } },
                    payments: true,
                },
            }),
            this.prisma.order.count({ where }),
        ]);

        return {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data,
        };
    }

    // async getOrderDetails(orderId: string) {
    //     const order = await this.prisma.order.findUnique({
    //         where: { id: orderId },
    //         include: {
    //             buyer: { include: { profile: true } },
    //             product: {
    //                 include: {
    //                     seller: { include: { profile: true } },
    //                 },
    //             },
    //             payments: true,
    //         },
    //     });

    //     if (!order) throw new NotFoundException("Order not found");

    //     return order;
    // }

    // async exportToCSV() {
    //     const orders = await this.prisma.order.findMany({
    //         include: {
    //             buyer: { include: { profile: true } },
    //             product: true,
    //             payments: true,
    //         },
    //     });

    //     // Build CSV text
    //     let csv = "Order ID,Customer,Product,Amount,Status,Date\n";

    //     orders.forEach((o) => {
    //         csv += `${o.id},${o.buyer.profile?.name || "N/A"},${o.product.title},${o.totalPrice},${o.status},${o.createdAt}\n`;
    //     });

    //     return {
    //         filename: "orders_report.csv",
    //         data: csv,
    //     };
    // }
}
