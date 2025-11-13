import { PrismaService } from "@lib/prisma/prisma.service";
import { QUEUE_JOB_NAME } from "@module/(buill-queue)/constants";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { InternalServerErrorException, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import Stripe from "stripe";
import { withdrawJobType } from "./contants";

@Processor(QUEUE_JOB_NAME.WITHDRAW.WITHDRAW_QUEUE_PROCESSOR)
export class WithdrawProcessor extends WorkerHost {
    private stripe: Stripe | null = null;
    private logger = new Logger(WithdrawProcessor.name);

    constructor(private prisma: PrismaService) {
        super();
        const secretKey = process.env.STRIPE_SECRET;
        if (!secretKey) throw new Error("STRIPE_SECRET_KEY not configured");
        this.stripe = new Stripe(secretKey, { apiVersion: "2025-10-29.clover" });
    }

    async process(job: Job): Promise<any> {
        console.info(job.name);
        try {
            if (job.queueName === QUEUE_JOB_NAME.CAP_LEVEL.CAP_LEVEL_QUEUE_NAME) {
                switch (job.name) {
                    case withdrawJobType.WITHDRAW:
                        // const { userId, amount } = job.data;
                        // todo: get the single user using the userId

                        const { withdrawId, cardId } = job.data;

                        const withdraw = await this.prisma.withdraw.findUnique({
                            where: { id: withdrawId },
                            include: { user: { include: { PaymentMethods: true } } },
                        });
                        if (!withdraw) throw new Error("Withdraw not found");

                        const card = withdraw.user.PaymentMethods.find((c) => c.id === cardId);
                        if (!card) throw new Error("Card not found");

                        if (!this.stripe)
                            throw new InternalServerErrorException("Fail to ini stri");
                        try {
                            // Create a Stripe payment to user's card (example with PaymentIntent)
                            const paymentIntent = await this.stripe.paymentIntents.create({
                                amount: Math.round(withdraw.amount * 100), // USD cents
                                currency: "usd",
                                payment_method: card.id, // assuming stored Stripe PaymentMethod ID
                                confirm: true,
                            });

                            await this.prisma.withdraw.update({
                                where: { id: withdraw.id },
                                data: {
                                    stripeTxnId: paymentIntent.id, // must match schema
                                    status: "SUCCESS",
                                },
                            });

                            this.logger.log(`Withdraw processed successfully: ${withdraw.id}`);
                        } catch (error: any) {
                            await this.prisma.withdraw.update({
                                where: { id: withdraw.id },
                                data: {
                                    status: "FAILED",
                                    errorMessage: (error as Error).message, // must match schema
                                },
                            });
                            this.logger.error(`Withdraw failed: ${withdraw.id} - ${error.message}`);
                        }
                        break;
                    default:
                        console.info("Default");
                }
            }
        } catch (err: any) {
            this.logger.error(`Job processing failed: ${job.name}`, err.stack);
        }
    }
    // @Process('process-withdraw')
    // async handleWithdraw(job: Job<{ withdrawId: string; cardId: string }>) {
    //     const { withdrawId, cardId } = job.data;

    //     const withdraw = await this.prisma.withdraw.findUnique({
    //         where: { id: withdrawId },
    //         include: { user: { include: { PaymentMethods: true } } },
    //     });
    //     if (!withdraw) throw new Error('Withdraw not found');

    //     const card = withdraw.user.PaymentMethods.find((c) => c.id === cardId);
    //     if (!card) throw new Error('Card not found');

    //     try {
    //         // Create a Stripe payment to user's card (example with PaymentIntent)
    //         const paymentIntent = await this.stripe.paymentIntents.create({
    //             amount: Math.round(withdraw.amount * 100), // USD cents
    //             currency: 'usd',
    //             payment_method: card.id, // assuming stored Stripe PaymentMethod ID
    //             confirm: true,
    //         });

    //         await this.prisma.withdraw.update({
    //             where: { id: withdraw.id },
    //             data: {
    //                 stripeTxnId: paymentIntent.id, // must match schema
    //                 status: 'SUCCESS',
    //             },
    //         });

    //         this.logger.log(`Withdraw processed successfully: ${withdraw.id}`);
    //     } catch (error: any) {
    //         await this.prisma.withdraw.update({
    //             where: { id: withdraw.id },
    //             data: {
    //                 status: 'FAILED',
    //                 errorMessage: (error as Error).message, // must match schema
    //             },
    //         });
    //         this.logger.error(`Withdraw failed: ${withdraw.id} - ${error.message}`);

    //     }
    // }
}
