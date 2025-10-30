import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { CapLevel, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const connection = new IORedis({ host: "localhost", port: 6379 });

export const capQueueWorker = new Worker(
  "capQueue",
  async (job: Job) => {
    console.log(job)
    console.log(` Worker picked up job: ${job.id}`);
    const { userIds } = job.data;
    console.log(`Processing ${userIds.length} users...`);

    const users = await prisma.userMetrics.findMany({
      where: { userId: { in: userIds } },
    });

    for (const user of users) {
      let capLevel: CapLevel = CapLevel.NONE;
      if (user.activityScore >= 8000) capLevel = CapLevel.RED;
      else if (user.activityScore >= 3000) capLevel = CapLevel.BLACK;
      else if (user.activityScore >= 800) capLevel = CapLevel.YELLOW;
      else if (user.activityScore >= 50) capLevel = CapLevel.GREEN;

      await prisma.user.update({
        where: { id: user.userId },
        data: { capLevel },
      });

      await prisma.userMetrics.update({
        where: { id: user.id },
        data: { activityScore: 0, lastUpdated: new Date() },
      });

      console.log(`Updated user ${user.userId} → ${capLevel}`);
    }

    console.log(` Finished batch of ${userIds.length} users`);
  },
  { connection }
);

// Optional event listeners for debugging
capQueueWorker.on("completed", (job) => {
  console.log(` Job ${job.id} completed successfully`);
});

capQueueWorker.on("failed", (job, err) => {
  console.error(` Job ${job?.id} failed:`, err);
});

