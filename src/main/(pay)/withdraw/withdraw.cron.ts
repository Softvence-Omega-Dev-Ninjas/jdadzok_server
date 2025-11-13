import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { WithdrawService } from "./withdraw.service";

@Injectable()
export class WithdrawCron {
    constructor(private withdrawService: WithdrawService) {}

    // Every 1st of the month at 12:00 AM
    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    async autoWithdraw() {
        await this.withdrawService.enqueueMonthlyWithdraws();
    }
}
