import { Body, Controller, Post } from "@nestjs/common";

import { CreateWithdrawDto } from "./dto/create-withdraw.dto";
import { WithdrawService } from "./withdraw.service";

@Controller("admin/withdraw")
export class WithdrawController {
    constructor(private readonly withdrawService: WithdrawService) {}

    // Admin triggers monthly payouts manually or via cron
    @Post("schedule")
    async scheduleMonthlyWithdraws() {
        return this.withdrawService.enqueueMonthlyWithdraws();
    }

    // User requests withdraw manually
    @Post("request")
    async requestWithdraw(@Body() dto: CreateWithdrawDto) {
        console.info(dto);
        return this.withdrawService.requestWithdraw(dto);
    }
}
