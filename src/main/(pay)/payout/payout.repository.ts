import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Payout, PayOutStatus, Prisma } from "@prisma/client";
import { CreatePayoutDto, PayoutQueryDto, PayoutStatsDto, UpdatePayoutDto } from "./dto/payout.dto";

@Injectable()
export class PayoutRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: string, data: CreatePayoutDto): Promise<Payout> {
        return this.prisma.payout.create({
            data: {
                ...data,
                userId: data.userId || userId, // Use provided userId or default to the authenticated user
                status: PayOutStatus.PENDING, // Always start as pending
            },
        });
    }

    async findAll(query?: PayoutQueryDto): Promise<Payout[]> {
        const where: Prisma.PayoutWhereInput = {};
        const orderBy: Prisma.PayoutOrderByWithRelationInput[] = [{ createdAt: "desc" }];

        if (query?.userId) {
            where.userId = query.userId;
        }

        if (query?.status) {
            where.status = query.status;
        }

        if (query?.method) {
            where.method = query.method;
        }

        if (query?.minAmount || query?.maxAmount) {
            where.amount = {};
            if (query.minAmount) {
                where.amount.gte = query.minAmount;
            }
            if (query.maxAmount) {
                where.amount.lte = query.maxAmount;
            }
        }

        if (query?.startDate || query?.endDate) {
            where.createdAt = {};
            if (query.startDate) {
                where.createdAt.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                where.createdAt.lte = new Date(query.endDate);
            }
        }

        return this.prisma.payout.findMany({
            where,
            orderBy,
            take: query?.limit || 50,
            skip: query?.offset || 0,
            include: {
                user: {
                    select: {
                        id: true,
                        profile: {
                            include: {
                                user: true,
                            },
                        },
                        email: true,
                    },
                },
            },
        });
    }

    async findByUserId(userId: string, limit = 50, offset = 0): Promise<Payout[]> {
        return this.prisma.payout.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        });
    }

    async findById(id: string): Promise<Payout | null> {
        return this.prisma.payout.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        profile: {
                            include: { user: true },
                        },
                        email: true,
                    },
                },
            },
        });
    }

    async findByIdAndUserId(id: string, userId: string): Promise<Payout | null> {
        return this.prisma.payout.findFirst({
            where: {
                id,
                userId,
            },
        });
    }

    async findPendingPayouts(limit = 100): Promise<Payout[]> {
        return this.prisma.payout.findMany({
            where: { status: PayOutStatus.PENDING },
            orderBy: { createdAt: "asc" }, // Process oldest first
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        profile: {
                            include: { user: true },
                        },
                        email: true,
                    },
                },
            },
        });
    }

    async findByStatus(status: PayOutStatus, limit = 50, offset = 0): Promise<Payout[]> {
        return this.prisma.payout.findMany({
            where: { status },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
            include: {
                user: {
                    select: {
                        id: true,
                        profile: { include: { user: true } },
                        email: true,
                    },
                },
            },
        });
    }

    async update(id: string, data: UpdatePayoutDto): Promise<Payout> {
        return this.prisma.payout.update({
            where: { id },
            data,
        });
    }

    async updateStatus(
        id: string,
        status: PayOutStatus,
        transactionId?: string,
        processorFee?: number,
    ): Promise<Payout> {
        const updateData: any = { status };

        if (transactionId) {
            updateData.transactionId = transactionId;
        }

        if (processorFee !== undefined) {
            updateData.processorFee = processorFee;
        }

        return this.prisma.payout.update({
            where: { id },
            data: updateData,
        });
    }

    async delete(id: string): Promise<Payout> {
        return this.prisma.payout.delete({
            where: { id },
        });
    }

    async deleteByIdAndUserId(id: string, userId: string): Promise<Payout | null> {
        try {
            return await this.prisma.payout.delete({
                where: {
                    id,
                    userId,
                },
            });
        } catch (error) {
            if (error.code === "P2025") {
                return null; // Record not found
            }
            throw error;
        }
    }

    async count(query?: PayoutQueryDto): Promise<number> {
        const where: Prisma.PayoutWhereInput = {};

        if (query?.userId) {
            where.userId = query.userId;
        }

        if (query?.status) {
            where.status = query.status;
        }

        if (query?.method) {
            where.method = query.method;
        }

        if (query?.minAmount || query?.maxAmount) {
            where.amount = {};
            if (query?.minAmount) {
                where.amount.gte = query.minAmount;
            }
            if (query?.maxAmount) {
                where.amount.lte = query.maxAmount;
            }
        }

        if (query?.startDate || query?.endDate) {
            where.createdAt = {};
            if (query?.startDate) {
                where.createdAt.gte = new Date(query.startDate);
            }
            if (query?.endDate) {
                where.createdAt.lte = new Date(query.endDate);
            }
        }

        return this.prisma.payout.count({ where });
    }

    async getStats(userId?: string): Promise<PayoutStatsDto> {
        const where = userId ? { userId } : {};

        const [totalStats, pendingStats, paidStats] = await Promise.all([
            this.prisma.payout.aggregate({
                where,
                _sum: {
                    amount: true,
                    processorFee: true,
                },
                _count: {
                    id: true,
                },
            }),
            this.prisma.payout.aggregate({
                where: { ...where, status: PayOutStatus.PENDING },
                _sum: {
                    amount: true,
                },
                _count: {
                    id: true,
                },
            }),
            this.prisma.payout.aggregate({
                where: { ...where, status: PayOutStatus.PAID },
                _sum: {
                    amount: true,
                },
                _count: {
                    id: true,
                },
            }),
        ]);

        return {
            totalAmount: totalStats._sum.amount || 0,
            totalCount: totalStats._count.id || 0,
            totalFees: totalStats._sum.processorFee || 0,
            pendingAmount: pendingStats._sum.amount || 0,
            pendingCount: pendingStats._count.id || 0,
            paidAmount: paidStats._sum.amount || 0,
            paidCount: paidStats._count.id || 0,
        };
    }

    async getTotalAmountByUser(userId: string): Promise<number> {
        const result = await this.prisma.payout.aggregate({
            where: {
                userId,
                status: PayOutStatus.PAID,
            },
            _sum: {
                amount: true,
            },
        });

        return result._sum.amount || 0;
    }

    async getPendingAmountByUser(userId: string): Promise<number> {
        const result = await this.prisma.payout.aggregate({
            where: {
                userId,
                status: PayOutStatus.PENDING,
            },
            _sum: {
                amount: true,
            },
        });

        return result._sum.amount || 0;
    }

    async getLastPayout(userId: string): Promise<Payout | null> {
        return this.prisma.payout.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
}
