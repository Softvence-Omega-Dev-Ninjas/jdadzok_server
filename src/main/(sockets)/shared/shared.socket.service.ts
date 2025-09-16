import { Injectable, Logger } from "@nestjs/common";
import { Server } from "socket.io";
import { NotificationEvent } from "../@types";
import { SOCKET_EVENTS } from "../constants/socket-events.constant";

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  // Send notification to specific user
  async sendNotificationToUser(
    userId: string,
    notification: Omit<NotificationEvent, "eventId" | "timestamp" | "userId">,
  ) {
    if (!this.server) return false;

    const notificationEvent: NotificationEvent = {
      ...notification,
      eventId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId: "system",
      read: false,
    };

    this.server
      .to(`user:${userId}`)
      .emit(SOCKET_EVENTS.NOTIFICATION.SEND, notificationEvent);
    this.logger.log(`System notification sent to user ${userId}`);
    return true;
  }

  // Broadcast system message to all users
  async broadcastSystemMessage(
    message: string,
    type: "info" | "warning" | "error" = "info",
  ) {
    console.info(type);
    if (!this.server) return false;

    this.server.emit(SOCKET_EVENTS.NOTIFICATION.SEND, {
      eventId: `system_${Date.now()}`,
      timestamp: new Date(),
      userId: "system",
      type: "system",
      title: "System Message",
      content: message,
      read: false,
    });

    this.logger.log(`System broadcast: ${message}`);
    return true;
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.server?.sockets?.sockets?.size || 0;
  }

  // Force disconnect user
  async disconnectUser(userId: string, reason = "Admin action") {
    if (!this.server) return false;

    const userRoom = `user:${userId}`;
    const sockets = await this.server.in(userRoom).fetchSockets();

    for (const socket of sockets) {
      socket.disconnect(true);
    }

    this.logger.log(`User ${userId} forcefully disconnected: ${reason}`);
    return true;
  }
}
