import { SocketResponse } from "@module/(sockets)/@types";
import { SOCKET_EVENTS } from "@module/(sockets)/constants/socket-events.constant";
import { Logger, UseGuards } from "@nestjs/common";
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SocketAuthGuard } from "../guards/socket-auth.guard";
import { SocketMiddleware } from "../middleware/socket.middleware";
import { RedisService } from "../services/redis.service";

@WebSocketGateway({
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
        credentials: true,
    },
    wsEngineL: "",
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
})
@UseGuards(SocketAuthGuard)
export abstract class BaseSocketGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() protected server: Server;
    protected readonly logger = new Logger(this.constructor.name);

    constructor(
        protected readonly redisService: RedisService,
        private readonly socketMiddleware: SocketMiddleware,
    ) { }

    async afterInit() {
        this.logger.verbose(`(${this.constructor.name}) Gateway initialized`);
        this.server.use(this.socketMiddleware.authenticate())
        this.server.use(this.socketMiddleware.logging());

        // await this.redisService.subscribe(SOCKET_EVENTS.CHAT.MESSAGE, (message: any) => {
        //     const parsed = JSON.parse(message);
        //     this.server.to(parsed.roomId).emit(SOCKET_EVENTS.CHAT.NEW_MESSAGE, parsed);
        // });
    }
    async handleConnection(client: Socket) {
        this.logger.log('onn connections: ', client.id)
        // const auth = this.socketMiddleware.authenticate();
        // console.log({ auth })
        // this.server.use(this.socketMiddleware.authenticate());
        // const user = client.data.user;
        // console.log([user])
        // if (!user?.id) return client.disconnect(true);

        // const socketUser: SocketUser = {
        //     id: user.id,
        //     socketId: client.id,
        //     email: user.email,
        //     status: "online",
        //     role: user.role,
        //     joinedAt: new Date(),
        // };

        // await this.redisService.setConnectedUser(client.id, socketUser);
        // await client.join(`user:${socketUser.id}`);

        // this.logger.log(`User ${socketUser.email} connected`);

        // client.emit(
        //     SOCKET_EVENTS.CONNECTION.CONNECT,
        //     this.createResponse(true, { user, serverTime: new Date() }),
        // );

        // // Broadcast join event
        // this.server.emit(SOCKET_EVENTS.CONNECTION.USER_JOINED, user);
    }

    async handleDisconnect(client: Socket) {
        const user = await this.redisService.getConnectedUser(client.id);
        if (!user) return;

        await this.redisService.removeConnectedUser(client.id);

        this.server.emit(SOCKET_EVENTS.CONNECTION.USER_LEFT, {
            userId: user.id,
            reason: "disconnect",
        });

        this.logger.log(`User ${user.email} disconnected`);
    }



    protected createResponse<T>(
        success: boolean,
        data?: T,
        error?: string,
    ): SocketResponse<T> {
        return { success, data, error, timestamp: new Date() };
    }
    // private handleUserLeaveRoom(roomId: string, userId: string) {
    //     const room = this.rooms.get(roomId);
    //     if (room) {
    //         room.users = room.users.filter((u) => u.id !== userId);

    //         // Remove empty rooms (except permanent ones)
    //         if (room.users.length === 0 && room.type !== "post") {
    //             this.rooms.delete(roomId);
    //         }
    //     }
    // }
    // // Get connected users in a room
    // protected getRoomUsers(roomId: string): SocketUser[] {
    //     const room = this.rooms.get(roomId);
    //     return room ? [...room.users] : [];
    // }

    // protected async joinRoom(
    //     client: Socket,
    //     roomId: string,
    //     roomData?: Partial<SocketRoom>,
    // ): Promise<boolean> {
    //     try {
    //         const userId = this.socketUsers.get(client.id);
    //         if (!userId) return false;

    //         await client.join(roomId);

    //         // Update or create room
    //         let room = this.rooms.get(roomId);
    //         if (!room) {
    //             room = {
    //                 id: roomId,
    //                 name: roomData?.name || roomId,
    //                 type: roomData?.type || "chat",
    //                 users: [],
    //                 createdAt: new Date(),
    //                 metadata: roomData?.metadata || {},
    //             };
    //             this.rooms.set(roomId, room);
    //         }

    //         // Add user to room if not already present
    //         const userInRoom = room.users.find((u) => u.id === userId);
    //         if (!userInRoom) {
    //             const user = this.connectedUsers.get(client.id);
    //             if (user) {
    //                 room.users.push(user);
    //             }
    //         }

    //         return true;
    //     } catch (error) {
    //         this.logger.error(`Error joining room ${roomId}: ${error.message}`);
    //         return false;
    //     }
    // }

    // protected async leaveRoom(client: Socket, roomId: string): Promise<boolean> {
    //     try {
    //         const userId = this.socketUsers.get(client.id);
    //         if (!userId) return false;

    //         await client.leave(roomId);
    //         this.handleUserLeaveRoom(roomId, userId);
    //         return true;
    //     } catch (error) {
    //         this.logger.error(`Error leaving room ${roomId}: ${error.message}`);
    //         return false;
    //     }
    // }
    // protected checkRateLimit(key: string, config: RateLimitConfig): boolean {
    //     const now = Date.now();
    //     const record = this.rateLimitStore.get(key);

    //     if (!record || now > record.resetTime) {
    //         this.rateLimitStore.set(key, {
    //             count: 1,
    //             resetTime: now + config.windowMs,
    //         });
    //         return true;
    //     }

    //     if (record.count >= config.maxRequests) {
    //         return false;
    //     }

    //     record.count++;
    //     return true;
    // }

    // protected emitToUser(userId: string, event: string, data: any): boolean {
    //     const socketId = this.userSockets.get(userId);
    //     if (!socketId) return false;

    //     const socket = this.server.sockets.sockets.get(socketId);
    //     if (!socket) return false;

    //     socket.emit(event, data);
    //     return true;
    // }

    // protected emitToRoom(roomId: string, event: string, data: any, excludeSocketId?: string): void {
    //     if (excludeSocketId) {
    //         this.server.to(roomId).except(excludeSocketId).emit(event, data);
    //     } else {
    //         this.server.to(roomId).emit(event, data);
    //     }
    // }

    // protected broadcastToAll<D = any>(event: string, data: D, excludeSocketId?: string): void {
    //     if (excludeSocketId) {
    //         this.server.except(excludeSocketId).emit(event, data);
    //     } else {
    //         this.server.emit(event, data);
    //     }
    // }

    // // Get user by user ID
    // protected getUserById(userId: string): SocketUser | undefined {
    //     const socketId = this.getSocketIdByUserId(userId);
    //     if (!socketId) {
    //         return undefined;
    //     }
    //     return this.getUser(socketId);
    // }

    // // Get user by socket ID
    // protected getUser(socketId: string): SocketUser | undefined {
    //     return this.connectedUsers.get(socketId);
    // }

    // // Get user ID by socket ID
    // protected getUserId(socketId: string): string | undefined {
    //     return this.socketUsers.get(socketId);
    // }

    // // Get socket ID by user ID
    // protected getSocketIdByUserId(userId: string): string | undefined {
    //     return this.userSockets.get(userId);
    // }


    // private setupHeartbeat(): void {
    //     // Send heartbeat every 30 seconds
    //     setInterval(() => {
    //         this.server.emit("heartbeat", { timestamp: new Date() });
    //     }, 30000);
    // }

    // // Public getters
    // get socketServer(): Server {
    //     return this.server;
    // }

    // get connectedUserCount(): number {
    //     return this.connectedUsers.size;
    // }

    // get activeRooms(): string[] {
    //     return Array.from(this.rooms.keys());
    // }
}
