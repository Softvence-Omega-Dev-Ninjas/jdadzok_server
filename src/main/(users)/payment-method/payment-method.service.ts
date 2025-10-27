import { Injectable, BadRequestException } from "@nestjs/common";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";
import { PaymentMethod } from "@prisma/client";
import { PrismaService } from "@lib/prisma/prisma.service";

@Injectable()
export class PaymentMethodsService {
    constructor(private readonly prisma: PrismaService) {}

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
        });
    }
}
