import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@lib/prisma/prisma.service";
import { capQueue } from "./cap.queue";

@Injectable()
export class CapLevelCronService {
  private readonly logger = new Logger(CapLevelCronService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_10_SECONDS) 
  async triggerCapEvaluation() {
    try {
      // Fetch all users from userMetrics table
      const users = await this.prisma.userMetrics.findMany({
        select: { id: true },
      });
      if (users.length === 0) {
        
        this.logger.log(" No users found for cap evaluation.");
        return;
      }

      const batchSize = 500;
      const totalBatches = Math.ceil(users.length / batchSize);
      this.logger.log(` Preparing ${totalBatches} batches...`);

      // Add jobs to the queue in batches
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize).map((u) => u.id);

      const res=  await capQueue.add("processCapBatch", { userIds: batch }, {
          removeOnComplete: true,
          removeOnFail: false,
        });
      }
      
      this.logger.log(" All batches successfully pushed to queue");
    } catch (err) {
      this.logger.error("Failed to push cap evaluation jobs:", err);
    }
  }
}
