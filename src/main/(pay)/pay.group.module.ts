import { Module } from "@nestjs/common";
import { PayoutModule } from "./payout/payout.module";

@Module({
    imports: [PayoutModule],
    providers: [],
    exports: [PayoutModule],
})
export class PayGroupModule {}
