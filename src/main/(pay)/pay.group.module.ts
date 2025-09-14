import { Module } from "@nestjs/common";
import { PaymentMethodModule } from "./payment-methods/payment.method.module";
import { PayoutModule } from "./payout/payout.module";

@Module({
  imports: [PaymentMethodModule, PayoutModule],
  providers: [],
  exports: [PaymentMethodModule, PayoutModule],
})
export class PayGroupModule {}
