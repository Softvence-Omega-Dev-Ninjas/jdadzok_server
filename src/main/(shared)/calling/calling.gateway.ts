// src/call/call.gateway.ts
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { CallingPayloadForSocketClient } from "@common/interface/calling-payload";
import { JWTPayload } from "@common/jwt/jwt.interface";
import { PrismaService } from "@lib/prisma/prisma.service";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { IceCandidateDto, JoinCallDto, StartMediaDto, WebRTCSignalDto } from "./dto/calling.dto";
import { CallService } from "./service/calling.service";

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true,
    },
    namespace: "/calling",
    pingInterval: 25000,
    pingTimeout: 20000,
    connectTimeout: 45000,

    allowEIO3: true,
})
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(CallGateway.name);
    private readonly clients = new Map<string, Set<Socket>>();
    private readonly socketToUserId = new Map<string, string>();
    private readonly socketToCallId = new Map<string, string>();
    private readonly pendingAuthentication = new Set<string>();
    constructor(
        private readonly callService: CallService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {}

    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        this.logger.log(`Socket.IO server initialized for calling Gateway: ${server.adapter.name}`);

        server.on("connect_error", (error) => {
            this.logger.error("Connection error:", error);
        });

        server.on("connect_timeout", () => {
            this.logger.error("Connection timeout");
        });
    }

    async handleConnection(client: Socket) {
        this.logger.log(`Client attempting connection: ${client.id}`);

        // Mark as pending authentication
        this.pendingAuthentication.add(client.id);

        // Try to authenticate immediately if token is in handshake
        const token = this.extractTokenFromSocket(client);

        if (token) {
            await this.authenticateClient(client, token);
        } else {
            // Give client 10 seconds to authenticate via 'authenticate' message
            this.logger.log(
                `Client ${client.id} connected without token, waiting for authentication`,
            );

            setTimeout(() => {
                if (this.pendingAuthentication.has(client.id)) {
                    this.logger.warn(`Client ${client.id} failed to authenticate within timeout`);
                    client.emit("authError", { message: "Authentication timeout" });
                    client.disconnect(true);
                }
            }, 10000);
        }
    }

    @SubscribeMessage("authenticate")
    async handleAuthenticate(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { token: string },
    ) {
        if (!this.pendingAuthentication.has(client.id)) {
            // Already authenticated
            return { success: true };
        }

        await this.authenticateClient(client, data.token);
        return { success: true };
    }

    private async authenticateClient(client: Socket, token: string) {
        try {
            if (!token) {
                this.logger.warn(`No token provided for client ${client.id}`);
                client.emit("authError", { message: "No token provided" });
                client.disconnect(true);
                return;
            }

            const payload = this.jwtService.verify<JWTPayload>(token, {
                secret: this.configService.getOrThrow("JWT_SECRET"),
            });

            if (!payload.sub) {
                this.logger.warn(`Invalid token payload for client ${client.id}`);
                client.emit("authError", { message: "Invalid token" });
                client.disconnect(true);
                return;
            }

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                },
            });

            if (!user) {
                this.logger.warn(`User not found: ${payload.sub}`);
                client.emit("authError", { message: "User not found" });
                client.disconnect(true);
                return;
            }

            const payloadForSocketClient: CallingPayloadForSocketClient = {
                sub: user.id,
                email: user.email,
            };

            client.data.user = payloadForSocketClient;
            this.subscribeClient(user.id, client);
            this.socketToUserId.set(client.id, user.id);
            this.pendingAuthentication.delete(client.id);

            // Emit connection success
            client.emit("authenticated", {
                socketId: client.id,
                userId: user.id,
            });

            this.logger.log(
                `Client authenticated: ${user.id} (email: ${user.email}) (socket: ${client.id})`,
            );
        } catch (err: any) {
            this.logger.warn(`Authentication failed for ${client.id}: ${err.message}`);
            client.emit("authError", { message: "Authentication failed" });
            client.disconnect(true);
        }
    }

    async handleDisconnect(client: Socket) {
        const userId = client.data?.user?.sub;

        this.pendingAuthentication.delete(client.id);

        if (userId) {
            // Handle active call cleanup
            const callId = this.socketToCallId.get(client.id);
            if (callId) {
                await this.handleUserLeavingCall(client, callId);
            }

            this.unsubscribeClient(userId, client);
            this.socketToUserId.delete(client.id);
            this.socketToCallId.delete(client.id);

            this.logger.log(`Client disconnected: ${userId} (socket: ${client.id})`);
        } else {
            this.logger.log(`Unauthenticated client disconnected: ${client.id}`);
        }
    }

    private extractTokenFromSocket(client: Socket): string | null {
        // Check multiple possible locations for the token
        const authHeader = client.handshake.headers.authorization;
        const authToken = client.handshake.auth?.token;
        const queryToken = client.handshake.query?.token as string;
        // Barer token

        if (!authHeader && !authToken && !queryToken) {
            return null;
        }

        let token: string | null = null;

        if (authHeader) {
            token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        } else if (authToken) {
            token = authToken;
        } else if (queryToken) {
            token = queryToken;
        }

        return token;
    }

    private subscribeClient(userId: string, client: Socket) {
        if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
        }
        this.clients.get(userId)!.add(client);
        this.logger.debug(`Subscribed client to user ${userId}`);
    }

    public getClientsForUser(userId: string): Set<Socket> {
        return this.clients.get(userId) || new Set();
    }

    private unsubscribeClient(userId: string, client: Socket) {
        const set = this.clients.get(userId);
        if (!set) return;

        set.delete(client);
        this.logger.debug(`Unsubscribed client from user ${userId}`);

        if (set.size === 0) {
            this.clients.delete(userId);
            this.logger.debug(`Removed empty client set for user ${userId}`);
        }
    }

    private requireAuth(client: Socket): boolean {
        if (!client.data?.user?.sub) {
            client.emit("error", { message: "Not authenticated" });
            return false;
        }
        return true;
    }

    @SubscribeMessage("joinCall")
    async handleJoinCall(@ConnectedSocket() socket: Socket, @MessageBody() data: JoinCallDto) {
        if (!this.requireAuth(socket)) return;

        try {
            const { callId, userName, hasVideo, hasAudio } = data;
            const userId = socket.data.user.sub;

            this.logger.log(`User ${userId} (${socket.id}) joining call: ${callId}`);

            // Leave previous call if exists
            const previousCallId = this.socketToCallId.get(socket.id);
            if (previousCallId && previousCallId !== callId) {
                await this.handleUserLeavingCall(socket, previousCallId);
            }

            // Validate the call
            const call = await this.callService.getCallById(callId);
            if (!call) {
                return socket.emit("error", { message: "Invalid call ID" });
            }

            if (["ENDED", "CANCELLED"].includes(call.status)) {
                return socket.emit("error", { message: "Call already finished" });
            }

            // Join WebSocket room
            socket.join(callId);
            this.socketToCallId.set(socket.id, callId);

            // Add/update participant in DB
            const participant = await this.callService.joinCall(
                callId,
                socket.id,
                userName,
                hasVideo ?? true,
                hasAudio ?? true,
                userId,
            );
            console.log(participant);
            // Fetch list of participants
            const callRoom = await this.callService.getCallRoom(callId);
            const participants = callRoom?.participants || [];

            // Notify others
            socket.to(callId).emit("userJoined", {
                socketId: socket.id,
                userId,
                userName,
                hasVideo,
                hasAudio,
            });

            // Return room data to this socket
            return socket.emit("joinedCall", {
                callId,
                userId,
                socketId: socket.id,
                participants,
            });
        } catch (error) {
            this.logger.error(`Error joining call: ${error.message}`);
            socket.emit("error", { message: "Internal server error" });
        }
    }

    @SubscribeMessage("startVideo")
    async handleStartVideo(@ConnectedSocket() socket: Socket, @MessageBody() data: StartMediaDto) {
        if (!this.requireAuth(socket)) return;

        try {
            const { callId } = data;
            await this.callService.updateMediaState(socket.id, callId, "video", true);

            socket.to(callId).emit("participantVideoStarted", {
                socketId: socket.id,
            });

            this.logger.log(`User ${socket.id} started video in call ${callId}`);
        } catch (error) {
            this.logger.error(`Error starting video: ${error.message}`);
            socket.emit("error", { message: "Failed to start video" });
        }
    }

    @SubscribeMessage("stopVideo")
    async handleStopVideo(@ConnectedSocket() socket: Socket, @MessageBody() data: StartMediaDto) {
        if (!this.requireAuth(socket)) return;

        try {
            const { callId } = data;
            await this.callService.updateMediaState(socket.id, callId, "video", false);

            socket.to(callId).emit("participantVideoStopped", {
                socketId: socket.id,
            });

            this.logger.log(`User ${socket.id} stopped video in call ${callId}`);
        } catch (error) {
            this.logger.error(`Error stopping video: ${error.message}`);
            socket.emit("error", { message: "Failed to stop video" });
        }
    }

    @SubscribeMessage("startAudio")
    async handleStartAudio(@ConnectedSocket() socket: Socket, @MessageBody() data: StartMediaDto) {
        if (!this.requireAuth(socket)) return;

        try {
            const { callId } = data;
            await this.callService.updateMediaState(socket.id, callId, "audio", true);

            socket.to(callId).emit("participantAudioStarted", {
                socketId: socket.id,
            });

            this.logger.log(`User ${socket.id} started audio in call ${callId}`);
        } catch (error) {
            this.logger.error(`Error starting audio: ${error.message}`);
            socket.emit("error", { message: "Failed to start audio" });
        }
    }

    @SubscribeMessage("stopAudio")
    async handleStopAudio(@ConnectedSocket() socket: Socket, @MessageBody() data: StartMediaDto) {
        if (!this.requireAuth(socket)) return;

        try {
            const { callId } = data;
            await this.callService.updateMediaState(socket.id, callId, "audio", false);

            socket.to(callId).emit("participantAudioStopped", {
                socketId: socket.id,
            });

            this.logger.log(`User ${socket.id} stopped audio in call ${callId}`);
        } catch (error) {
            this.logger.error(`Error stopping audio: ${error.message}`);
            socket.emit("error", { message: "Failed to stop audio" });
        }
    }

    @SubscribeMessage("offer")
    handleOffer(@ConnectedSocket() socket: Socket, @MessageBody() data: WebRTCSignalDto) {
        if (!this.requireAuth(socket)) return;

        try {
            const targetSocket = this.server.sockets.sockets.get(data.targetSocketId);

            if (!targetSocket) {
                this.logger.warn(`Target socket ${data.targetSocketId} not found for offer`);
                socket.emit("error", { message: "Target peer not found" });
                return;
            }

            this.logger.debug(`Relaying offer from ${socket.id} to ${data.targetSocketId}`);

            targetSocket.emit("offer", {
                offer: data.signal,
                senderId: socket.id,
            });
        } catch (error) {
            this.logger.error(`Error relaying offer: ${error.message}`);
        }
    }

    @SubscribeMessage("answer")
    handleAnswer(@ConnectedSocket() socket: Socket, @MessageBody() data: WebRTCSignalDto) {
        if (!this.requireAuth(socket)) return;

        try {
            const targetSocket = this.server.sockets.sockets.get(data.targetSocketId);

            if (!targetSocket) {
                this.logger.warn(`Target socket ${data.targetSocketId} not found for answer`);
                socket.emit("error", { message: "Target peer not found" });
                return;
            }

            this.logger.debug(`Relaying answer from ${socket.id} to ${data.targetSocketId}`);

            targetSocket.emit("answer", {
                answer: data.signal,
                senderId: socket.id,
            });
        } catch (error) {
            this.logger.error(`Error relaying answer: ${error.message}`);
        }
    }

    @SubscribeMessage("iceCandidate")
    handleIceCandidate(@ConnectedSocket() socket: Socket, @MessageBody() data: IceCandidateDto) {
        if (!this.requireAuth(socket)) return;

        try {
            const targetSocket = this.server.sockets.sockets.get(data.targetSocketId);

            if (!targetSocket) {
                this.logger.warn(
                    `Target socket ${data.targetSocketId} not found for ICE candidate`,
                );
                return;
            }

            this.logger.debug(`Relaying ICE candidate from ${socket.id} to ${data.targetSocketId}`);

            targetSocket.emit("iceCandidate", {
                candidate: data.candidate,
                senderId: socket.id,
            });
        } catch (error) {
            this.logger.error(`Error relaying ICE candidate: ${error.message}`);
        }
    }

    @SubscribeMessage("leaveCall")
    async handleLeaveCall(
        @ConnectedSocket() socket: Socket,
        @MessageBody() data: { callId: string },
    ) {
        if (!this.requireAuth(socket)) return;
        await this.handleUserLeavingCall(socket, data.callId);
    }

    private async handleUserLeavingCall(socket: Socket, callId: string) {
        try {
            this.logger.log(`User ${socket.id} leaving call ${callId}`);

            socket.leave(callId);
            this.socketToCallId.delete(socket.id);

            const room = await this.callService.leaveCall(socket.id, callId);

            // Notify others
            socket.to(callId).emit("participantLeft", {
                socketId: socket.id,
            });

            // Clean up empty rooms
            if (room && room.participants.length === 0) {
                await this.callService.deleteCall(callId);
                this.logger.log(`Call ${callId} deleted (no participants)`);
            }
        } catch (error) {
            this.logger.error(`Error leaving call: ${error.message}`, error.stack);
        }
    }

    // Utility methods
    public getActiveCallsCount(): number {
        return this.socketToCallId.size;
    }

    public getAuthenticatedClientsCount(): number {
        return this.socketToUserId.size;
    }
}
