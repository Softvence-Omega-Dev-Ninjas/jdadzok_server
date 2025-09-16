// import { Logger } from "@nestjs/common";
// import {
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   WebSocketServer,
// } from "@nestjs/websockets";
// import { RedisService } from "@project/common/redis/redis.service";
// import { AppSocketEvents } from "@project/main/(sockets)/shared/events";
// import { Server, Socket } from "socket.io";

// export abstract class BaseGateway
//   implements OnGatewayConnection, OnGatewayDisconnect
// {
//   @WebSocketServer()
//   protected server: Server;
//   protected logger = new Logger(this.constructor.name);

//   constructor(protected readonly redisService: RedisService) {}

//   async handleConnection(client: Socket): Promise<void> {
//     const userId = client.handshake.query?.userId as string;
//     if (!userId) {
//       this.logger.warn(
//         `Client ${client.id} attempted to connect without userId`,
//       );
//       client.disconnect();
//       return;
//     }
//     this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
//     await this.redisService.set<string>("SOCKET", client.id, "1h", userId);
//     client.join(`user_${userId}`);
//   }

//   async handleDisconnect(client: Socket): Promise<void> {
//     const userId = client.handshake.query?.userId as string;
//     if (userId) {
//       this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
//       await this.redisService.delete("SOCKET", userId);
//     }
//   }

//   protected emit<E extends keyof AppSocketEvents, T = any>(
//     event: E,
//     payload: SocketPayload<T>,
//   ): void {
//     if (payload.to) {
//       const receivers = Array.isArray(payload.to) ? payload.to : [payload.to];
//       receivers.forEach((id) => this.server.to(id).emit(event, payload));
//     } else if (payload.roomId) {
//       this.server.to(payload.roomId).emit(event, payload);
//     } else {
//       this.server.emit(event, payload);
//     }
//   }

//   protected on<T = any>(
//     event: string,
//     handler: (payload: SocketPayload<T>, socket: Socket) => void,
//   ): void {
//     this.server.on("connection", (socket: Socket) => {
//       socket.on(event, (payload: SocketPayload<T>) => handler(payload, socket));
//     });
//   }

//   protected getSocketServer(): Server {
//     return this.server;
//   }
// }
