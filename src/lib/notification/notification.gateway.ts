import { EVENT_TYPES } from "@common/interface/events-name";
import { Community, Notification } from "@common/interface/events-payload";
import { PayloadForSocketClient } from "@common/interface/socket-client-payload";
import { JWTPayload } from "@common/jwt/jwt.interface";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PrismaService } from "../prisma/prisma.service";
@WebSocketGateway({
    cors: { origin: "*" },
    namespace: "/js/notification",
})
@Injectable()
export class NotificationGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(NotificationGateway.name);
    private readonly clients = new Map<string, Set<Socket>>();
    private userSockets = new Map<string, string>();
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) { }

    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        this.logger.log(
            "Socket.IO server initialized for Notification Gateway",
            server.adapter.name,
        );
    }

    async handleConnection(client: Socket) {
        try {
            const token = this.extractTokenFromSocket(client);
            if (!token) return client.disconnect(true);

            const payload = this.jwtService.verify<JWTPayload>(token, {
                secret: this.configService.getOrThrow("JWT_SECRET"),
            });

            if (!payload.sub) return client.disconnect(true);

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    NotificationToggle: true,
                },
            });

            if (!user) return client.disconnect(true);
            // --------- when disconnect then true-----------
            if (!user.NotificationToggle?.length) {
                await this.prisma.notificationToggle.create({
                    data: { userId: user.id },
                });
                user.NotificationToggle = await this.prisma.notificationToggle.findMany({
                    where: { userId: user.id },
                });
            }
            const payloadForSocketClient: PayloadForSocketClient = {
                sub: user.id,
                email: user.email,
                emailToggle: user.NotificationToggle?.[0]?.email ?? true,
                userUpdates: user.NotificationToggle?.[0]?.userUpdates ?? true,
                communication: user.NotificationToggle?.[0]?.communication ?? true,
                community: user.NotificationToggle?.[0]?.community ?? true,
                comment: user.NotificationToggle?.[0]?.comment ?? true,
                post: user.NotificationToggle?.[0]?.post ?? true,
                message: user.NotificationToggle?.[0]?.message ?? true,
                userRegistration: user.NotificationToggle?.[0]?.userRegistration ?? true,
            };


            client.data.user = payloadForSocketClient;
            this.subscribeClient(user.id, client);

            this.logger.log(`Client connected: ${user.id}`);
        } catch (err: any) {
            this.logger.warn(`JWT verification failed: ${err.message}`);
            client.disconnect(true);
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data?.user?.sub;
        if (userId) this.unsubscribeClient(userId, client);
    }

    private extractTokenFromSocket(client: Socket): string | null {
        const authHeader = client.handshake.headers.authorization || client.handshake.auth?.token;
        if (!authHeader) return null;
        return authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    }

    private subscribeClient(userId: string, client: Socket) {
        if (!this.clients.has(userId)) this.clients.set(userId, new Set());
        this.clients.get(userId)!.add(client);
        this.logger.debug(`Subscribed client to user ${userId}`);
    }

    private unsubscribeClient(userId: string, client: Socket) {
        const set = this.clients.get(userId);
        if (!set) return;
        set.delete(client);
        if (set.size === 0) this.clients.delete(userId);
    }

    public getClientsForUser(userId: string): Set<Socket> {
        return this.clients.get(userId) || new Set();
    }

    // Notify single user
    public async notifySingleUser(userId: string, event: string, data: Notification) {
        const clients = this.getClientsForUser(userId);
        if (!clients.size) return this.logger.warn(`No clients connected for user ${userId}`);

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) return;

        clients.forEach((client) => client.emit(event, data));
        this.logger.log(`Notification sent to user ${userId} via event ${event}`);
    }

    public async notifyMultipleUsers(userIds: string[], event: string, data: Notification) {
        for (const userId of userIds) {
            await this.notifySingleUser(userId, event, data);
        }
    }

    public async notifyAllUsers(event: string, data: Notification) {
        this.clients.forEach((clients) => {
            clients.forEach((client) => client.emit(event, data));
        });
    }

    public getDelay(publishAt: Date): number {
        const delay = publishAt.getTime() - Date.now();
        return delay > 0 ? delay : 0;
    }

    @SubscribeMessage("ping")
    handlePing(client: Socket) {
        this.logger.debug("Received ping from client");
        client.emit("pong");
    }
    @SubscribeMessage("Community_CREATE")
    handlePong(client: Socket) {
        this.logger.debug("Received pong from client");
        client.emit("Community_CREATE");
    }

    // ✅ Listen for Community_CREATE event
    // @OnEvent(EVENT_TYPES.Community_CREATE)
    // handleCommunityCreated(payload: Community) {
    //     console.log('📢 Broadcasting notification to all users');

    //     if (!payload.info?.recipients) return;

    //     for (const recipient of payload.info.recipients) {
    //         const socketId = this.userSockets.get(recipient.id);
    //         if (socketId) {
    //             this.server.to(socketId).emit('notification', {
    //                 title: payload.info.title,
    //                 message: payload.info.message,
    //                 communityId: payload.meta.communityId,
    //             });
    //         }
    //     }
    //     console.log("Sockets currently connected:", this.userSockets);
    // }

    @OnEvent(EVENT_TYPES.COMMUNITY_CREATE)
    async handleCommunityCreated(payload: Community) {
        this.logger.log("📢 Broadcasting Community_CREATE notification");

        if (!payload.info?.recipients) {
            this.logger.warn("No recipients provided in Community_CREATE payload");
            return;
        }

        for (const recipient of payload.info.recipients) {
            const socketId = this.userSockets.get(recipient.id);
            if (socketId) {
                const clients = this.getClientsForUser(recipient.id);
                const client = Array.from(clients).find((c) => c.id === socketId);
                if (client && client.data.user.community) {
                    // Check community toggle
                    this.server.to(socketId).emit("notification", {
                        type: "Community_CREATE",
                        title: payload.info.title,
                        message: payload.info.message,
                        createdAt: new Date(),
                        meta: { communityId: payload.meta.communityId },
                    });
                    this.logger.log(
                        `Notification sent to user ${recipient.id} (socket ${socketId})`,
                    );
                } else {
                    this.logger.warn(`User ${recipient.id} has community notifications disabled`);
                }
            } else {
                this.logger.warn(`No socket found for user ${recipient.id}`);
            }
        }
        this.logger.debug("Sockets currently connected:", Array.from(this.userSockets.entries()));
    }
}
