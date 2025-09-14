// import { createClient } from '@keyv/redis';
// import { Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import {
//     OnGatewayConnection,
//     OnGatewayDisconnect,
//     OnGatewayInit,
//     WebSocketServer
// } from '@nestjs/websockets';
// import { ENVEnum } from '@project/common/enum/env.enum';
// import { RedisService } from '@project/common/redis/redis.service';
// import { createAdapter } from "@socket.io/redis-adapter";
// import { Server, Socket } from 'socket.io';
// import { SocketPayload } from '../@types/socket.type';
// import { AppSocketEvents } from './events';

// export class SocketGateway
//     implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
//     @WebSocketServer() server: Server;
//     private logger = new Logger(SocketGateway.name);

//     constructor(
//         private readonly redisService: RedisService,
//         private readonly configService: ConfigService
//     ) { }

//     async afterInit(server: Server) {
//         // Redis pub/sub for horizontal scaling
//         const pubClient = createClient({
//             url: this.configService.getOrThrow<string>(ENVEnum.REDIS_URL),
//         });
//         const subClient = pubClient.duplicate();

//         await pubClient.connect();
//         await subClient.connect();

//         server.adapter(createAdapter(pubClient, subClient))
//     }
//     async handleConnection(client: Socket) {
//         const userId = client.handshake.query?.userId;
//         this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
//         await this.redisService.set<string>('SOCKET', client.id, '1h', String(userId));
//     }

//     async handleDisconnect(client: Socket) {
//         const userId = client.handshake.query?.userId;
//         this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
//         await this.redisService.delete('SOCKET', String(userId));
//     }

//     emit = <E extends keyof AppSocketEvents, T = any>(
//         event: E,
//         payload: SocketPayload<T>
//     ) => {
//         if (payload.to) {
//             const receivers = Array.isArray(payload.to) ? payload.to : [payload.to];
//             receivers.forEach((id) => this.server.to(id).emit(event, payload));
//         } else if (payload.roomId) {
//             this.server.to(payload.roomId).emit(event, payload);
//         } else {
//             this.server.emit(event, payload);
//         }
//     };

//     on<T = any>(
//         event: string,
//         handler: (payload: SocketPayload<T>, socket: Socket) => void
//     ) {
//         this.server.on('connection', (socket: Socket) => {
//             socket.on(event, (payload: SocketPayload<T>) => handler(payload, socket));
//         });
//     }

//     get getSocketServer() {
//         return this.server;
//     }
// }
