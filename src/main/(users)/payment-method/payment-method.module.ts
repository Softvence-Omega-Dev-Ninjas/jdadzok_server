import { Module } from "@nestjs/common";
import { PaymentMethodsController } from "./payment-method.controller";
import { PaymentMethodsService } from "./payment-method.service";
import { PrismaService } from "@lib/prisma/prisma.service";

@Module({
    controllers: [PaymentMethodsController],
    providers: [PaymentMethodsService, PrismaService],
    exports: [PaymentMethodsService],
})
export class PaymentMethodsModule {}
