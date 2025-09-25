import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import {
    CreatePaymentMethodDto,
    PaymentMethodQueryDto,
    UpdatePaymentMethodDto,
} from "./dto/payment-method.dto";

@Injectable()
export class PaymentMethodRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: string, data: CreatePaymentMethodDto) {
        // If this is being set as default, unset other default payment methods for this user
        if (data.isDefault) {
            await this.prisma.paymentMethods.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }

        return this.prisma.paymentMethods.create({
            data: {
                ...data,
                userId,
            },
        });
    }

    async findAll(query?: PaymentMethodQueryDto) {
        const where: Prisma.PaymentMethodsWhereInput = {};

        if (query?.userId) {
            where.userId = query.userId;
        }

        if (query?.method) {
            where.method = query.method;
        }

        if (query?.isDefault !== undefined) {
            where.isDefault = query.isDefault;
        }

        return this.prisma.paymentMethods.findMany({
            where,
            orderBy: [
                { isDefault: "desc" }, // Default methods first
                { createdAt: "desc" },
            ],
        });
    }

    async findByUserId(userId: string) {
        return this.prisma.paymentMethods.findMany({
            where: { userId },
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        });
    }

    async findById(id: string) {
        return this.prisma.paymentMethods.findUnique({
            where: { id },
        });
    }

    async findByIdAndUserId(id: string, userId: string) {
        return this.prisma.paymentMethods.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                user: true,
            },
        });
    }

    async findDefaultByUserId(userId: string) {
        return this.prisma.paymentMethods.findFirst({
            where: {
                userId,
                isDefault: true,
            },
        });
    }

    async update(id: string, data: UpdatePaymentMethodDto) {
        // If this is being set as default, unset other default payment methods for this user
        if (data.isDefault) {
            const paymentMethod = await this.findById(id);
            if (paymentMethod) {
                await this.prisma.paymentMethods.updateMany({
                    where: {
                        userId: paymentMethod.userId,
                        id: { not: id },
                    },
                    data: { isDefault: false },
                });
            }
        }

        return this.prisma.paymentMethods.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return this.prisma.paymentMethods.delete({
            where: { id },
        });
    }

    async deleteByIdAndUserId(id: string, userId: string) {
        try {
            return await this.prisma.paymentMethods.delete({
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

    async count(userId?: string): Promise<number> {
        return this.prisma.paymentMethods.count({
            where: userId ? { userId } : {},
        });
    }

    async setAsDefault(id: string, userId: string) {
        // Unset all other default payment methods for this user
        await this.prisma.paymentMethods.updateMany({
            where: {
                userId,
                id: { not: id },
            },
            data: { isDefault: false },
        });

        // Set this one as default
        return this.prisma.paymentMethods.update({
            where: { id },
            data: { isDefault: true },
        });
    }
}
