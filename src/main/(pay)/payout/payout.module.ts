import { Module } from "@nestjs/common";
import { PayoutController } from "./payout.controller";
import { PayoutRepository } from "./payout.repository";
import { PayoutService } from "./payout.service";

@Module({
  imports: [],
  controllers: [PayoutController],
  providers: [PayoutRepository, PayoutService],
  exports: [PayoutService, PayoutRepository],
})
export class PayoutModule {}
