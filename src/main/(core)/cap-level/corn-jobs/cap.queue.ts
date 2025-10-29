import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Redis connection
const connection = new IORedis({ host: 'localhost', port: 6379 });

// Export the queue to be used in the Cron job
export const capQueue = new Queue('capQueue', { connection });
