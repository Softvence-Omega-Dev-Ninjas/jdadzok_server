import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import Stripe from "stripe";
import { ConfigService } from "@nestjs/config";
import { CreateWithdrawDto } from "./dto/create-withdraw.dto";
import { PrismaService } from "@lib/prisma/prisma.service";

@Injectable()
export class WithdrawService {
    private stripe: Stripe;
    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
        @InjectQueue("withdraw-queue") private withdrawQueue: Queue,
    ) {
        const secretKey = process.env.STRIPE_SECRET_KEY;
        if (!secretKey) throw new Error("STRIPE_SECRET_KEY not configured");

        this.stripe = new Stripe(secretKey, {
            apiVersion: "2025-10-29.clover",
        });
    }

    // user requests withdraw manually
    async requestWithdraw(dto: CreateWithdrawDto) {
        const withdraw = await this.prisma.withdraw.create({
            data: {
                userId: dto.userId,
                amount: dto.amount,
            },
        });

        await this.withdrawQueue.add("process-withdraw", { withdrawId: withdraw.id });
        return { message: "Withdraw queued successfully", withdraw };
    }

    // monthly payout scheduler
    async enqueueMonthlyWithdraws() {
        const pendingUsers = await this.prisma.user.findMany({
            where: {
                revenues: { some: { amount: { gt: 0 } } },
            },
            include: { revenues: true },
        });

        type Revenue = { amount: number; };
        type User = { id: string; revenues: Revenue[] };


        for (const user of pendingUsers) {
            const total = user.revenues.reduce((a: number, r: Revenue) => a + r.amount, 0);

            await this.withdrawQueue.add("process-withdraw", {
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
            data: { status: "SUCCESS", stripeId: payout.id, processedAt: new Date() },
        });

        return payout;
    }
}
