import { Queue } from "bullmq";
import IORedis from "ioredis";

// Use 'redis' — the Docker service name — not localhost
const connection = new IORedis({
  host: "redis",
  port: 6379,
});

export const capQueue = new Queue("capQueue", { connection });
