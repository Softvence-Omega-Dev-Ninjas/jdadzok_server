import { Queue } from "bullmq";
import IORedis from "ioredis";

// Redis connection
const connection = new IORedis(6379, "localhost");

// Export the queue to be used in the Cron job
export const capQueue = new Queue("capQueue", { connection });
