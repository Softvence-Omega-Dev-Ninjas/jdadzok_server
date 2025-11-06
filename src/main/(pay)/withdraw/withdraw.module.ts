import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { WithdrawController } from "./withdraw.controller";
import { WithdrawService } from "./withdraw.service";
import { WithdrawProcessor } from "./withdraw.processor";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@lib/prisma/prisma.service";

@Module({
    imports: [
        BullModule.registerQueue({
            name: "withdraw-queue",
        }),
    ],
    controllers: [WithdrawController],
    providers: [WithdrawService, WithdrawProcessor, PrismaService, ConfigService],
})
export class WithdrawModule {}
