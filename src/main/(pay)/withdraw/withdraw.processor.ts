import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { WithdrawService } from "./withdraw.service";

@Processor("withdraw-queue")
export class WithdrawProcessor {
    constructor(private withdrawService: WithdrawService) {}

    @Process("process-withdraw")
    async handleWithdraw(job: Job<{ userId: string; amount: number; withdrawId?: string }>) {
        try {
            const { userId, amount } = job.data;
            await this.withdrawService.processWithdraw(userId, amount);
            console.log(`✅ Withdraw processed for user ${userId}`);
        } catch (err) {
            console.error(`❌ Withdraw failed for user ${job.data.userId}:`, err.message);
        }
    }
}
