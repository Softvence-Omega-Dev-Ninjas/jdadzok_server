// import { ENVEnum } from '@common/enum/env.enum';
// import { INestApplicationContext, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { IoAdapter } from '@nestjs/platform-socket.io';
// import { createAdapter } from '@socket.io/redis-adapter';
// import { createClient } from 'redis';
// import { Server, ServerOptions } from 'socket.io';

// export class RedisIoAdapter extends IoAdapter {
//     private readonly logger = new Logger(RedisIoAdapter.name);
//     private adapterConstructor: ReturnType<typeof createAdapter> | undefined;

//     constructor(app: INestApplicationContext) {
//         super(app);
//         // Defer Redis connection to createIOServer to ensure synchronous access
//     }

//     async connectToRedis(redisUrl: string): Promise<void> {
//         this.logger.log(`Connecting to Redis at ${redisUrl}`);
//         try {
//             const pubClient = createClient({ url: redisUrl });
//             const subClient = pubClient.duplicate();

//             // Log client creation
//             this.logger.debug('Redis clients created');

//             // Handle Redis errors
//             pubClient.on('error', (err) => this.logger.error('Redis Pub Client Error', err));
//             subClient.on('error', (err) => this.logger.error('Redis Sub Client Error', err));

//             // Connect clients
//             await Promise.all([pubClient.connect(), subClient.connect()]);
//             this.logger.debug('Redis clients connected');

//             // Create adapter
//             this.adapterConstructor = createAdapter(pubClient, subClient);
//             this.logger.debug('Redis adapter created successfully');
//         } catch (error) {
//             this.logger.error('Failed to connect to Redis', error);
//             throw error;
//         }
//     }

//     async createIOServer(port: number, options?: ServerOptions): Promise<Server> {
//         this.logger.log(`Creating Socket.io server on port ${port}`);

//         const configService = this.app.get(ConfigService);
//         const redisUrl = configService.getOrThrow<string>(ENVEnum.REDIS_URL);

//         // Ensure Redis is connected before creating server
//         if (!this.adapterConstructor) {
//             await this.connectToRedis(redisUrl);
//         }

//         if (!this.adapterConstructor) {
//             this.logger.error('Adapter constructor not initialized after connection attempt');
//             throw new Error('Redis adapter not initialized');
//         }

//         const server = super.createIOServer(port, {
//             ...options,
//             cors: { origin: '*', methods: ['GET', 'POST'], credentials: true },
//         });

//         try {
//             server.adapter(this.adapterConstructor);
//             this.logger.debug('Redis adapter applied to Socket.io server');
//         } catch (error) {
//             this.logger.error('Failed to apply Redis adapter', error);
//             throw error;
//         }

//         return server;
//     }
// }
