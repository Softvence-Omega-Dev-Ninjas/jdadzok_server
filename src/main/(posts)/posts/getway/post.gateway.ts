// import { Logger } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import {
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   OnGatewayInit,
//   WebSocketGateway,
//   WebSocketServer,
// } from "@nestjs/websockets";
// import { RedisService } from "@project/common/redis/redis.service";
// import { SocketPayload } from "@project/main/(sockets)/@types/socket.type";
// import { createSocketConfig } from "@project/main/(sockets)/shared/configs";
// import { AppSocketEvents } from "@project/main/(sockets)/shared/events";
// import { Server, Socket } from "socket.io";

// @WebSocketGateway({ ...createSocketConfig(new ConfigService()) })
// export class PostGateway
//   implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
// {
//   @WebSocketServer() server: Server;
//   private logger = new Logger(PostGateway.name);

//   constructor(private readonly redisService: RedisService) {}

//   afterInit(server: any) {
//     console.info(server);
//   }
//   async handleConnection(client: Socket) {
//     const userId = client.handshake.query?.userId;
//     this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
//     await this.redisService.set<string>(
//       "SOCKET",
//       client.id,
//       "1h",
//       String(userId),
//     );
//   }

//   async handleDisconnect(client: Socket) {
//     const userId = client.handshake.query?.userId;
//     this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
//     await this.redisService.delete("SOCKET", String(userId));
//   }

//   emit = <E extends keyof AppSocketEvents, T = any>(
//     event: E,
//     payload: SocketPayload<T>,
//   ) => {
//     if (payload.to) {
//       const receivers = Array.isArray(payload.to) ? payload.to : [payload.to];
//       receivers.forEach((id) => this.server.to(id).emit(event, payload));
//     } else if (payload.roomId) {
//       this.server.to(payload.roomId).emit(event, payload);
//     } else {
//       this.server.emit(event, payload);
//     }
//   };

//   on<T = any>(
//     event: string,
//     handler: (payload: SocketPayload<T>, socket: Socket) => void,
//   ) {
//     this.server.on("connection", (socket: Socket) => {
//       socket.on(event, (payload: SocketPayload<T>) => handler(payload, socket));
//     });
//   }

//   get getSocketServer() {
//     return this.server;
//   }
// }
