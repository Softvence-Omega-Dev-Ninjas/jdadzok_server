import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { PaymentsModule } from "../payment/payments.module";

@Module({
    imports: [PaymentsModule],
    controllers: [OrderController],
    providers: [OrderService],
})
export class OrderModule {}
