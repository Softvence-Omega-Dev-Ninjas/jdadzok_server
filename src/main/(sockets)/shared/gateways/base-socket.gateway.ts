import {
  RateLimitConfig,
  SocketResponse,
  SocketRoom,
  SocketUser,
} from "@module/(sockets)/@types";
import { SOCKET_EVENTS } from "@module/(sockets)/constants/socket-events.constant";
import { Logger } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
})
export abstract class BaseSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() protected server: Server;
  protected readonly logger = new Logger(this.constructor.name);

  // In-memory stores (replace with Redis in production)
  protected connectedUsers = new Map<string, SocketUser>();
  protected userSockets = new Map<string, string>(); // userId -> socketId
  protected socketUsers = new Map<string, string>(); // socketId -> userId
  protected rooms = new Map<string, SocketRoom>();
  protected rateLimitStore = new Map<
    string,
    { count: number; resetTime: number }
  >();

  afterInit() {
    this.logger.log("Socket Gateway initialized");
    this.setupRedis();
    this.setupRateLimiting();
    this.setupHeartbeat();
  }

  async handleConnection(client: Socket) {
    try {
      const socketUser = await this.extractUserFromSocket(client);
      if (!socketUser?.id) {
        client.disconnect(true);
        return;
      }

      const user: SocketUser = {
        id: socketUser.id,
        socketId: client.id,
        status: "online",
        role: socketUser.role,
        joinedAt: new Date(),
      };

      // Handle reconnection
      const existingSocketId = this.userSockets.get(socketUser.id);
      if (existingSocketId && existingSocketId !== client.id) {
        // Disconnect old socket
        const oldSocket = this.server.sockets.sockets.get(existingSocketId);
        if (oldSocket) {
          oldSocket.disconnect(true);
        }
      }

      this.connectedUsers.set(client.id, user);
      this.userSockets.set(socketUser.id, client.id);
      this.socketUsers.set(client.id, socketUser.id);

      // Join user to their personal room
      await client.join(`user:${socketUser.id}`);

      this.logger.log(
        `User ${socketUser.id} connected with socket ${client.id}`,
      );

      // Notify others about user joining
      client.broadcast.emit(SOCKET_EVENTS.CONNECTION.USER_JOINED, user);

      // Send connection success response
      client.emit(
        SOCKET_EVENTS.CONNECTION.CONNECT,
        this.createResponse(true, {
          user,
          serverTime: new Date(),
        }),
      );
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) return;

    const user = this.connectedUsers.get(client.id);
    if (!user) return this.logger.error("No user found to disconnect");

    // Cleanup
    this.connectedUsers.delete(client.id);
    this.userSockets.delete(userId);
    this.socketUsers.delete(client.id);

    // Leave all rooms
    const rooms = Array.from(client.rooms);
    for (const roomId of rooms) {
      client.leave(roomId);
      this.handleUserLeaveRoom(roomId, userId);
    }

    this.logger.log(`User ${userId} disconnected from socket ${client.id}`);

    // Notify others about user leaving
    client.broadcast.emit(SOCKET_EVENTS.CONNECTION.USER_LEFT, {
      userId,
      reason: "disconnect",
    });
  }

  // Protected utility methods
  protected async extractUserFromSocket(
    client: Socket,
  ): Promise<SocketUser | null> {
    // Extract user ID from auth token, session, etc.
    const token =
      client.handshake.auth?.accessToken ||
      client.handshake.headers?.authorization;

    if (!token) {
      this.logger.warn(`No auth token provided for socket ${client.id}`);
      return null;
    }

    try {
      // Implement your JWT/auth validation here
      // we have to find user from db by their id and return it but for now let's return dammy
      return {
        id: "0",
        role: "USER",
        socketId: client.id,
        status: "online",
        joinedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Auth validation failed: ${error.message}`);
      return null;
    }
  }

  protected createResponse<T>(
    success: boolean,
    data?: T,
    error?: string,
  ): SocketResponse<T> {
    return {
      success,
      data,
      error,
      timestamp: new Date(),
    };
  }

  protected async joinRoom(
    client: Socket,
    roomId: string,
    roomData?: Partial<SocketRoom>,
  ): Promise<boolean> {
    try {
      const userId = this.socketUsers.get(client.id);
      if (!userId) return false;

      await client.join(roomId);

      // Update or create room
      let room = this.rooms.get(roomId);
      if (!room) {
        room = {
          id: roomId,
          name: roomData?.name || roomId,
          type: roomData?.type || "chat",
          users: [],
          createdAt: new Date(),
          metadata: roomData?.metadata || {},
        };
        this.rooms.set(roomId, room);
      }

      // Add user to room if not already present
      const userInRoom = room.users.find((u) => u.id === userId);
      if (!userInRoom) {
        const user = this.connectedUsers.get(client.id);
        if (user) {
          room.users.push(user);
        }
      }

      return true;
    } catch (error) {
      this.logger.error(`Error joining room ${roomId}: ${error.message}`);
      return false;
    }
  }

  protected async leaveRoom(client: Socket, roomId: string): Promise<boolean> {
    try {
      const userId = this.socketUsers.get(client.id);
      if (!userId) return false;

      await client.leave(roomId);
      this.handleUserLeaveRoom(roomId, userId);
      return true;
    } catch (error) {
      this.logger.error(`Error leaving room ${roomId}: ${error.message}`);
      return false;
    }
  }

  private handleUserLeaveRoom(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.users = room.users.filter((u) => u.id !== userId);

      // Remove empty rooms (except permanent ones)
      if (room.users.length === 0 && room.type !== "post") {
        this.rooms.delete(roomId);
      }
    }
  }

  protected checkRateLimit(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const record = this.rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    if (record.count >= config.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  protected emitToUser(userId: string, event: string, data: any): boolean {
    const socketId = this.userSockets.get(userId);
    if (!socketId) return false;

    const socket = this.server.sockets.sockets.get(socketId);
    if (!socket) return false;

    socket.emit(event, data);
    return true;
  }

  protected emitToRoom(
    roomId: string,
    event: string,
    data: any,
    excludeSocketId?: string,
  ): void {
    if (excludeSocketId) {
      this.server.to(roomId).except(excludeSocketId).emit(event, data);
    } else {
      this.server.to(roomId).emit(event, data);
    }
  }

  protected broadcastToAll(
    event: string,
    data: any,
    excludeSocketId?: string,
  ): void {
    if (excludeSocketId) {
      this.server.except(excludeSocketId).emit(event, data);
    } else {
      this.server.emit(event, data);
    }
  }

  // Get connected users in a room
  protected getRoomUsers(roomId: string): SocketUser[] {
    const room = this.rooms.get(roomId);
    return room ? [...room.users] : [];
  }

  // Get user by socket ID
  protected getUser(socketId: string): SocketUser | undefined {
    return this.connectedUsers.get(socketId);
  }

  // Get user ID by socket ID
  protected getUserId(socketId: string): string | undefined {
    return this.socketUsers.get(socketId);
  }

  // Abstract methods to be implemented by derived classes
  protected abstract setupRedis(): void;

  private setupRateLimiting(): void {
    // Clean up rate limit store every 5 minutes
    setInterval(
      () => {
        const now = Date.now();
        for (const [key, record] of this.rateLimitStore.entries()) {
          if (now > record.resetTime) {
            this.rateLimitStore.delete(key);
          }
        }
      },
      5 * 60 * 1000,
    );
  }

  private setupHeartbeat(): void {
    // Send heartbeat every 30 seconds
    setInterval(() => {
      this.server.emit("heartbeat", { timestamp: new Date() });
    }, 30000);
  }

  // Public getters
  get socketServer(): Server {
    return this.server;
  }

  get connectedUserCount(): number {
    return this.connectedUsers.size;
  }

  get activeRooms(): string[] {
    return Array.from(this.rooms.keys());
  }
}
