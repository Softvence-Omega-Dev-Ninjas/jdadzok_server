import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PaymentMethods } from "@prisma/client";
import {
    CreatePaymentMethodDto,
    PaymentMethodQueryDto,
    PaymentMethodResponseDto,
    UpdatePaymentMethodDto,
} from "./dto/payment-method.dto";
import { PaymentMethodRepository } from "./payment-method.repository";

@Injectable()
export class PaymentMethodService {
    constructor(private readonly paymentMethodRepository: PaymentMethodRepository) {}

    async createPaymentMethod(
        userId: string,
        createDto: CreatePaymentMethodDto,
    ): Promise<PaymentMethodResponseDto> {
        try {
            // Check if user already has too many payment methods
            const existingCount = await this.paymentMethodRepository.count(userId);
            if (existingCount >= 5) {
                // Limit to 5 payment methods per user
                throw new BadRequestException("Maximum number of payment methods reached (5)");
            }

            // If no other payment methods exist, make this one default
            if (existingCount === 0) {
                createDto.isDefault = true;
            }

            // Encrypt/tokenize sensitive data here if needed
            const encryptedData = await this.encryptSensitiveData(createDto);

            const paymentMethod = await this.paymentMethodRepository.create(userId, encryptedData);
            return this.transformToResponse(paymentMethod);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException("Failed to create payment method");
        }
    }

    async findUserPaymentMethods(userId: string): Promise<PaymentMethodResponseDto[]> {
        const paymentMethods = await this.paymentMethodRepository.findByUserId(userId);
        return paymentMethods.map((pm) => this.transformToResponse(pm));
    }

    async findPaymentMethods(query?: PaymentMethodQueryDto): Promise<PaymentMethodResponseDto[]> {
        const paymentMethods = await this.paymentMethodRepository.findAll(query);
        return paymentMethods.map((pm) => this.transformToResponse(pm));
    }

    async findPaymentMethodById(id: string, userId?: string): Promise<PaymentMethodResponseDto> {
        const paymentMethod = userId
            ? await this.paymentMethodRepository.findByIdAndUserId(id, userId)
            : await this.paymentMethodRepository.findById(id);

        if (!paymentMethod) {
            throw new NotFoundException("Payment method not found");
        }

        return this.transformToResponse(paymentMethod);
    }

    async findDefaultPaymentMethod(userId: string): Promise<PaymentMethodResponseDto | null> {
        const paymentMethod = await this.paymentMethodRepository.findDefaultByUserId(userId);
        return paymentMethod ? this.transformToResponse(paymentMethod) : null;
    }

    async updatePaymentMethod(
        id: string,
        userId: string,
        updateDto: UpdatePaymentMethodDto,
    ): Promise<PaymentMethodResponseDto> {
        const existingPaymentMethod = await this.paymentMethodRepository.findByIdAndUserId(
            id,
            userId,
        );
        if (!existingPaymentMethod) {
            throw new NotFoundException("Payment method not found");
        }

        try {
            // Encrypt/tokenize sensitive data if being updated
            const encryptedData = await this.encryptSensitiveData(updateDto);

            const updatedPaymentMethod = await this.paymentMethodRepository.update(
                id,
                encryptedData,
            );
            return this.transformToResponse(updatedPaymentMethod);
        } catch (error) {
            console.info(error);
            throw new BadRequestException("Failed to update payment method");
        }
    }

    async deletePaymentMethod(id: string, userId: string): Promise<void> {
        const paymentMethod = await this.paymentMethodRepository.findByIdAndUserId(id, userId);
        if (!paymentMethod) {
            throw new NotFoundException("Payment method not found");
        }

        // If this is the default payment method, check if there are others
        if (paymentMethod.isDefault) {
            const userPaymentMethods = await this.paymentMethodRepository.findByUserId(userId);
            if (userPaymentMethods.length > 1) {
                // Set another payment method as default
                const nextDefault = userPaymentMethods.find((pm) => pm.id !== id);
                if (nextDefault) {
                    await this.paymentMethodRepository.setAsDefault(nextDefault.id, userId);
                }
            }
        }

        await this.paymentMethodRepository.delete(id);
    }

    async setAsDefault(id: string, userId: string): Promise<PaymentMethodResponseDto> {
        const paymentMethod = await this.paymentMethodRepository.findByIdAndUserId(id, userId);
        if (!paymentMethod) {
            throw new NotFoundException("Payment method not found");
        }

        const updatedPaymentMethod = await this.paymentMethodRepository.setAsDefault(id, userId);
        return this.transformToResponse(updatedPaymentMethod);
    }

    private async encryptSensitiveData(
        data: CreatePaymentMethodDto | UpdatePaymentMethodDto,
    ): Promise<any> {
        // In a real application, you would encrypt sensitive data here
        // For now, we'll just mask the card number for storage
        const processedData = { ...data };

        if (data.cardNumber) {
            // In production, encrypt this data
            // For demo purposes, we'll store it as-is but this should be encrypted/tokenized
            processedData.cardNumber = data.cardNumber;
        }

        if (data.CVC) {
            // Never store CVC in production - this should be handled by payment processor
            delete processedData.CVC;
        }

        return processedData;
    }

    private transformToResponse(paymentMethod: PaymentMethods): PaymentMethodResponseDto {
        return {
            id: paymentMethod.id,
            userId: paymentMethod.userId,
            method: paymentMethod.method,
            cardHolder: paymentMethod.cardHolder,
            cardNumber: paymentMethod.cardNumber, // This should be encrypted in DB
            maskedCardNumber: this.maskCardNumber(paymentMethod.cardNumber),
            expireMonth: paymentMethod.expireMonth,
            expireYear: paymentMethod.expireYear,
            isDefault: paymentMethod.isDefault,
            createdAt: paymentMethod.createdAt,
            updatedAt: paymentMethod.updatedAt,
        };
    }

    private maskCardNumber(cardNumber: string): string {
        if (!cardNumber || cardNumber.length < 4) {
            return "**** **** **** ****";
        }

        const last4 = cardNumber.slice(-4);
        const masked = "**** **** **** " + last4;
        return masked;
    }

    async validatePaymentMethodOwnership(id: string, userId: string): Promise<boolean> {
        const paymentMethod = await this.paymentMethodRepository.findByIdAndUserId(id, userId);
        return !!paymentMethod;
    }
}
