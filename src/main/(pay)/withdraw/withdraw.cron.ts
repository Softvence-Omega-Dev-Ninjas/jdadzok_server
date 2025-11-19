import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { WithdrawService } from "./withdraw.service";

@Injectable()
export class WithdrawCron {
    constructor(private withdrawService: WithdrawService) {}

    @Cron("0 0 0 15 * *") // প্রতি মাসের 15 তারিখ রাত 12AM
    async autoWithdraw() {
        await this.withdrawService.enqueueMonthlyWithdraws();
    }
}
