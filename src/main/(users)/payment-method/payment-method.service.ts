import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";
import { PaymentMethod } from "@prisma/client";
import { PrismaService } from "@lib/prisma/prisma.service";

@Injectable()
export class PaymentMethodsService {
    constructor(private readonly prisma: PrismaService) {}

    // added stripe account...
    async addStripeMethod(userId: string, dto: CreatePaymentMethodDto) {
        // Check if user already has a Stripe payment method
        const existing = await this.prisma.paymentMethods.findFirst({
            where: {
                userId,
                method: PaymentMethod.STRIPE,
            },
        });

        if (existing) {
            throw new BadRequestException("You already have a Stripe payment method.");
        }

        // Create new payment method
        return this.prisma.paymentMethods.create({
            data: {
                userId,
                method: PaymentMethod.STRIPE,
                cardHolder: dto.cardHolder,
                cardNumber: dto.cardNumber,
                expireMonth: dto.expireMonth,
                expireYear: dto.expireYear,
                CVC: dto.CVC,
                isDefault: dto.isDefault ?? false,
            },
            select: {
                id: true,
                cardHolder: true,
                cardNumber: true,
                method: true,
                createdAt: true,
            },
        });
    }

    // Get payment method for logged-in user
    async getMyPaymentMethod(userId: string) {
        const method = await this.prisma.paymentMethods.findFirst({
            where: { userId },
            select: {
                id: true,
                cardHolder: true,
                cardNumber: true,
                method: true,
                createdAt: true,
            },
        });
        if (!method) throw new NotFoundException("No payment method found for this user.");
        return method;
    }

    // Delete payment method
    async deleteMyPaymentMethod(userId: string) {
        const existing = await this.prisma.paymentMethods.findFirst({ where: { userId } });
        if (!existing) throw new NotFoundException("No payment method found to delete.");

        await this.prisma.paymentMethods.delete({ where: { id: existing.id } });
        return { message: "Payment method deleted successfully." };
    }
}
