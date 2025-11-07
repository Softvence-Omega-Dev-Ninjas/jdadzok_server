import { PrismaService } from "@lib/prisma/prisma.service";
import { QUEUE_JOB_NAME } from "@module/(buill-queue)/constants";
import { InjectQueue } from "@nestjs/bullmq";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bullmq";
import Stripe from "stripe";

@Injectable()
export class WithdrawService {
    private stripe: Stripe;
    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
        @InjectQueue(QUEUE_JOB_NAME.WITHDRAW.WITHDRAW_QUEUE) private withdrawQueue: Queue,
    ) {
        const secretKey = process.env.STRIPE_SECRET;
        if (!secretKey) throw new Error("STRIPE_SECRET not configured");

        this.stripe = new Stripe(secretKey, {
            apiVersion: "2025-10-29.clover",
        });
    }

    // user requests withdraw manually
    async requestWithdraw(dto: { userId: string; amount: number }) {
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
            include: { PaymentMethods: true },
        });
        if (!user) throw new NotFoundException("User not found");

        const card = user.PaymentMethods.find((c) => c.isDefault);
        if (!card) throw new BadRequestException("No default payment method found");

        // Create withdraw record in DB
        const withdraw = await this.prisma.withdraw.create({
            data: {
                userId: dto.userId,
                amount: dto.amount,
            },
        });

        // Queue the withdraw for async processing
        await this.withdrawQueue.add("process-withdraw", {
            withdrawId: withdraw.id,
            cardId: card.id,
        });

        return {
            message: "Withdraw queued successfully",
            // withdraw,
        };
    }

    // monthly payout scheduler
    async enqueueMonthlyWithdraws() {
        const pendingUsers = await this.prisma.user.findMany({
            where: {
                revenues: { some: { amount: { gt: 0 } } },
            },
            include: { revenues: true },
        });

        type Revenue = { amount: number };
        // type User = { id: string; revenues: Revenue[] };

        for (const user of pendingUsers) {
            const total = user.revenues.reduce((a: number, r: Revenue) => a + r.amount, 0);

            await this.withdrawQueue.add(QUEUE_JOB_NAME.WITHDRAW.WITHDRAW_QUEUE, {
                userId: user.id,
                amount: total,
            });
        }

        return { message: "All user withdraws enqueued" };
    }

    async processWithdraw(userId: string, amount: number) {
        const paymentMethod = await this.prisma.paymentMethods.findFirst({
            where: { userId, method: "STRIPE", isDefault: true },
        });

        if (!paymentMethod) throw new Error("No default Stripe account found");
        //  stripe_account_id
        const stripeAccountId = paymentMethod.cardNumber;

        const payout = await this.stripe.payouts.create(
            {
                amount: Math.floor(amount * 100), // cents
                currency: "usd",
            },
            { stripeAccount: stripeAccountId },
        );

        await this.prisma.withdraw.updateMany({
            where: { userId, status: "PENDING" },
            data: {
                status: "SUCCESS",
                stripeTxnId: payout.id,
            },
        });
        return payout;
    }
}
