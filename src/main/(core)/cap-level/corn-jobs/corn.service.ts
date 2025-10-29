import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@lib/prisma/prisma.service";
import { capQueue } from "./cap.queue";

@Injectable()
export class CapLevelCronService {
    constructor(private prisma: PrismaService) {}

    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    async triggerCapEvaluation() {
        const users = await this.prisma.userMetrics.findMany({ select: { id: true } });

        const batchSize = 500;
        for (let i = 0; i < users.length; i += batchSize) {
            const batch = users.slice(i, i + batchSize).map((u) => u.id);
            await capQueue.add("processCapBatch", { userIds: batch });
        }

        console.log("✅ All batches pushed to queue");
    }
}
