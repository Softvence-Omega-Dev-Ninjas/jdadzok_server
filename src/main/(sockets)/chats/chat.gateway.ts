import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
} from "@nestjs/websockets";
import { Socket } from "socket.io";
import { ChatMessage, ChatTyping, RATE_LIMITS } from "../@types";
import { BaseSocketGateway } from "../base/abstract-socket.gateway";
import { SOCKET_EVENTS } from "../constants/socket-events.constant";
@WebSocketGateway({
    namespace: "/chats",
    cors: { origin: true, credentials: true },
})
export class ChatGateway extends BaseSocketGateway {
    @SubscribeMessage(SOCKET_EVENTS.CHAT.MESSAGE_SEND)
    async handleChatMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: Omit<ChatMessage, "eventId" | "timestamp" | "userId">,
    ) {
        const userId = this.getUserId(client.id);
        if (!userId) {
            client.emit(
                SOCKET_EVENTS.ERROR.UNAUTHORIZED,
                this.createResponse(false, null, "User not authenticated"),
            );
            return;
        }

        // Rate limiting
        const rateLimitKey = `chat:${userId}`;
        if (!this.checkRateLimit(rateLimitKey, RATE_LIMITS.CHAT_MESSAGE)) {
            client.emit(
                SOCKET_EVENTS.ERROR.RATE_LIMIT,
                this.createResponse(false, null, "Too many messages. Please slow down."),
            );
            return;
        }

        // Validate message
        if (!data.message?.trim()) {
            client.emit(
                SOCKET_EVENTS.ERROR.VALIDATION,
                this.createResponse(false, null, "Message cannot be empty"),
            );
            return;
        }

        const message: ChatMessage = {
            ...data,
            eventId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            userId,
        };

        try {
            // If roomId is specified, send to room; otherwise broadcast to all
            if (message.roomId) {
                // Ensure user is in the room
                const roomUsers = this.getRoomUsers(message.roomId);
                const isInRoom = roomUsers.some((u) => u.id === userId);

                if (!isInRoom) {
                    client.emit(
                        SOCKET_EVENTS.ERROR.UNAUTHORIZED,
                        this.createResponse(false, null, "You are not in this room"),
                    );
                    return;
                }

                this.emitToRoom(
                    message.roomId,
                    SOCKET_EVENTS.CHAT.MESSAGE_RECEIVE,
                    message,
                    client.id,
                );
            } else {
                // Broadcast to all connected users
                this.broadcastToAll(SOCKET_EVENTS.CHAT.MESSAGE_RECEIVE, message, client.id);
            }

            // Send success response to sender
            client.emit(SOCKET_EVENTS.CHAT.MESSAGE_SEND, this.createResponse(true, message));

            this.logger.log(`Chat message sent by user ${userId}: ${message.eventId}`);
        } catch (error) {
            this.logger.error(`Error handling chat message: ${error.message}`);
            client.emit(
                SOCKET_EVENTS.ERROR.SERVER_ERROR,
                this.createResponse(false, null, "Failed to send message"),
            );
        }
    }

    @SubscribeMessage(SOCKET_EVENTS.CHAT.MESSAGE_TYPING)
    async handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: Omit<ChatTyping, "eventId" | "timestamp" | "userId">,
    ) {
        const userId = this.getUserId(client.id);
        if (!userId) return;

        const typingEvent: ChatTyping = {
            ...data,
            eventId: `typing_${Date.now()}`,
            timestamp: new Date(),
            userId,
        };

        if (data.roomId) {
            this.emitToRoom(data.roomId, SOCKET_EVENTS.CHAT.MESSAGE_TYPING, typingEvent, client.id);
        } else {
            this.broadcastToAll(SOCKET_EVENTS.CHAT.MESSAGE_TYPING, typingEvent, client.id);
        }
    }

    @SubscribeMessage(SOCKET_EVENTS.ROOM.JOIN)
    async handleJoinChatRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string; roomName?: string },
    ) {
        const userId = this.getUserId(client.id);
        if (!userId) {
            client.emit(
                SOCKET_EVENTS.ERROR.UNAUTHORIZED,
                this.createResponse(false, null, "User not authenticated"),
            );
            return;
        }

        // Rate limiting
        if (!this.checkRateLimit(`room_join:${userId}`, RATE_LIMITS.ROOM_JOIN)) {
            client.emit(
                SOCKET_EVENTS.ERROR.RATE_LIMIT,
                this.createResponse(false, null, "Too many room joins. Please wait."),
            );
            return;
        }

        const success = await this.joinRoom(client, data.roomId, {
            name: data.roomName || data.roomId,
            type: "chat",
        });

        if (success) {
            const roomUsers = this.getRoomUsers(data.roomId);

            client.emit(
                SOCKET_EVENTS.ROOM.JOIN,
                this.createResponse(true, {
                    roomId: data.roomId,
                    users: roomUsers,
                }),
            );

            // Notify other room members
            this.emitToRoom(
                data.roomId,
                SOCKET_EVENTS.CONNECTION.USER_JOINED,
                {
                    userId,
                    roomId: data.roomId,
                },
                client.id,
            );

            this.logger.log(`User ${userId} joined chat room ${data.roomId}`);
        } else {
            client.emit(
                SOCKET_EVENTS.ERROR.SERVER_ERROR,
                this.createResponse(false, null, "Failed to join room"),
            );
        }
    }

    @SubscribeMessage(SOCKET_EVENTS.ROOM.LEAVE)
    async handleLeaveChatRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string },
    ) {
        const userId = this.getUserId(client.id);
        if (!userId) return;

        const success = await this.leaveRoom(client, data.roomId);

        if (success) {
            client.emit(
                SOCKET_EVENTS.ROOM.LEAVE,
                this.createResponse(true, {
                    roomId: data.roomId,
                }),
            );

            // Notify other room members
            this.emitToRoom(data.roomId, SOCKET_EVENTS.CONNECTION.USER_LEFT, {
                userId,
                roomId: data.roomId,
            });

            this.logger.log(`User ${userId} left chat room ${data.roomId}`);
        }
    }

    protected setupRedis(): void {
        // Implement Redis pub/sub for horizontal scaling
        // This will be used for cross-server communication
        this.logger.log("Setting up Redis for chat gateway");
    }
}
