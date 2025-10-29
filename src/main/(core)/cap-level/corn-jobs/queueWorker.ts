import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { CapLevel, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const connection = new IORedis({ host: "localhost", port: 6379 });

export const capQueueWorker = new Worker(
    "capQueue",
    async (job: Job) => {
        const { userIds } = job.data;
        const now = new Date();

        // Fetch users for this batch
        const users = await prisma.userMetrics.findMany({ where: { userId: { in: userIds } } });

        for (const user of users) {
            let capLevel: CapLevel = CapLevel.NONE;
            if (user.activityScore >= 300) capLevel = CapLevel.YELLOW;
            else if (user.activityScore >= 200) capLevel = CapLevel.RED;
            else if (user.activityScore >= 100) capLevel = CapLevel.OSTRICH_FEATHER;

            // Update user cap level and reset activity score
            await prisma.user.update({
                where: { id: user.userId },
                data: { capLevel },
            });

            await prisma.userMetrics.update({
                where: { id: user.id },
                data: { activityScore: 0, lastUpdated: now },
            });
        }

        console.log(`✅ Processed batch of ${userIds.length} users`);
    },
    { connection },
);
