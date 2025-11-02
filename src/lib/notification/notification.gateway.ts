import { EVENT_TYPES } from "@common/interface/events-name";
import { Community, Ngo, Notification, PostEvent } from "@common/interface/events-payload";
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
                emailToggle: user.NotificationToggle?.[0]?.email || false,
                userUpdates: user.NotificationToggle?.[0]?.userUpdates || false,
                communication: user.NotificationToggle?.[0]?.communication || false,
                community: user.NotificationToggle?.[0]?.community || false,
                comment: user.NotificationToggle?.[0]?.comment || false,
                post: user.NotificationToggle?.[0]?.post || false,
                message: user.NotificationToggle?.[0]?.message || false,
                ngo: user.NotificationToggle?.[0]?.ngo ?? true,
                userRegistration: user.NotificationToggle?.[0]?.userRegistration || false,
            };

            client.data.user = payloadForSocketClient;
            this.subscribeClient(user.id, client);

            this.logger.log(`Client connected: ${user.id}`);
        } catch (err: any) {
            this.logger.warn(`JWT verification failed: ${err.message}`);
            client.disconnect(true);
        }
    }

    /**
     * Handles the disconnection of a client from the server.
     *
     * If a user ID is associated with the client, it unsubscribes the client from
     * the user's notification room and logs the disconnection with the user ID.
     * If no user ID is associated, logs the disconnection for an unknown user.
     *
     * @param client - The socket client that has disconnected.
     */

    handleDisconnect(client: Socket) {
        const userId = client.data?.user?.sub;
        if (userId) {
            this.unsubscribeClient(userId, client);
            this.logger.log(`Client disconnected: ${userId}`);
        } else {
            this.logger.log("Client disconnected: unknown user");
        }
    }

    /**
     * Extracts the JWT token from the client's headers or query.
     *
     * If the token is present in the Authorization header, it is extracted.
     * If the token is not present in the Authorization header, the query
     * parameter 'token' is checked for the token. If the token is present in
     * the query parameter, it is extracted.
     *
     * If the token is not present in either the Authorization header or the
     * query parameter, null is returned.
     *
     * If the token is present in the Authorization header but is not a Bearer
     * token, the raw token is returned.
     *
     * @param client - The socket client.
     * @returns The extracted JWT token or null if not present.
     */
    private extractTokenFromSocket(client: Socket): string | null {
        const authHeader = client.handshake.headers.authorization || client.handshake.auth?.token;

        if (!authHeader) return null;

        return authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    }

    /**
     * Subscribes a client to a user's notification room.
     *
     * If the user ID is not present in the clients map, a new Set is created
     * and associated with the user ID. The client is then added to the Set.
     * A log message is recorded with the user ID.
     *
     * @param userId - The ID of the user to subscribe the client to.
     * @param client - The client socket to subscribe.
     */
    private subscribeClient(userId: string, client: Socket) {
        if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
        }
        this.clients.get(userId)!.add(client);
        this.logger.debug(`Subscribed client to user ${userId}`);
    }

    /**
     * Unsubscribes a client from a user's notification room.
     *
     * If the user ID is not present in the clients map, the function does
     * nothing.
     * If the user ID is present in the clients map, the client is removed
     * from the Set associated with the user ID. If the Set is then empty, it
     * is removed from the map.
     * A log message is recorded with the user ID.
     *
     * @param userId - The ID of the user to unsubscribe the client from.
     * @param client - The client socket to unsubscribe.
     */
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

    /**
     * Retrieves the set of clients subscribed to the given user's notification room.
     *
     * If the user ID is not present in the clients map, an empty Set is returned.
     *
     * @param userId - The ID of the user to retrieve clients for.
     * @returns A Set of client sockets subscribed to the user's notification room.
     */
    public getClientsForUser(userId: string): Set<Socket> {
        return this.clients.get(userId) || new Set();
    }

    /**
     * Calculates the delay in milliseconds between the current time and the given
     * publish date.
     * If the publish date is in the past, the delay is set to 0.
     * @param publishAt - The date to calculate the delay for.
     * @returns The calculated delay in milliseconds.
     */
    public getDelay(publishAt: Date): number {
        const delay = publishAt.getTime() - Date.now();
        return delay > 0 ? delay : 0;
    }

    public async notifySingleUser(
        userId: string,
        event: string,
        data: Notification,
    ): Promise<void> {
        const clients = this.getClientsForUser(userId);
        if (clients.size === 0) {
            this.logger.warn(`No clients connected for user ${userId}`);
            return;
        }

        clients.forEach((client) => {
            client.emit(event, data);
            this.logger.log(`Notification sent to user ${userId} via event ${event}`);
        });
    }

    public async notifyMultipleUsers(
        userIds: string[],
        event: string,
        data: Notification,
    ): Promise<void> {
        if (userIds.length === 0) {
            this.logger.warn("No user IDs provided for notification");
            return;
        }

        userIds.forEach((userId) => {
            this.notifySingleUser(userId, event, data);
        });
    }

    public async notifyAllUsers(event: string, data: Notification): Promise<void> {
        this.clients.forEach((clients, userId) => {
            clients.forEach((client) => {
                client.emit(event, data);
                this.logger.log(
                    `Notification sent to all users via event ${event} for user ${userId}`,
                );
            });
        });
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

    @SubscribeMessage(EVENT_TYPES.COMMENT_CREATE)
    handleSomething(purpose: string, client: Socket) {
        client.broadcast.emit(purpose, {});
    }

    // @OnEvent(EVENT_TYPES.COMMUNITY_CREATE)
    // async handleCommunityCreated(payload: Community) {
    //     this.logger.log("📢 Broadcasting Community_CREATE notification");

    //     if (!payload.info?.recipients) {
    //         this.logger.warn("No recipients provided in Community_CREATE payload");
    //         return;
    //     }

    //     for (const recipient of payload.info.recipients) {
    //         const socketId = this.userSockets.get(recipient.id);
    //         if (socketId) {
    //             const clients = this.getClientsForUser(recipient.id);
    //             const client = Array.from(clients).find((c) => c.id === socketId);
    //             if (client && client.data.user.community) {
    //                 // Check community toggle
    //                 this.server.to(socketId).emit(EVENT_TYPES.COMMUNITY_CREATE, {
    //                     type: EVENT_TYPES.COMMUNITY_CREATE,
    //                     title: payload.info.title,
    //                     message: payload.info.message,
    //                     createdAt: new Date(),
    //                     meta: { communityId: payload.meta.communityId },
    //                 });
    //                 this.logger.log(
    //                     `Notification sent to user ${recipient.id} (socket ${socketId})`,
    //                 );
    //             } else {
    //                 this.logger.warn(`User ${recipient.id} has community notifications disabled`);
    //             }
    //         } else {
    //             this.logger.warn(`No socket found for user ${recipient.id}`);
    //         }
    //     }
    //     this.logger.debug("Sockets currently connected:", Array.from(this.userSockets.entries()));
    // }

    @OnEvent(EVENT_TYPES.COMMUNITY_CREATE)
    async handlCommnityCreated(payload: Community) {
        this.logger.log("COMMUNITY_CREATE EVENT RECEIVED");
        this.logger.log(`Payload: ${JSON.stringify(payload, null, 2)}`);

        if (!payload.info?.recipients?.length) {
            this.logger.warn("No recipients in payload → skipping emit");
            return;
        }

        this.logger.log(`Found ${payload.info.recipients.length} recipient(s)`);

        for (const r of payload.info.recipients) {
            this.logger.log(`--- Processing recipient: ${r.id} (${r.email}) ---`);

            const clients = this.getClientsForUser(r.id);
            this.logger.log(`  → Total connected sockets for this user: ${clients.size}`);

            if (clients.size === 0) {
                this.logger.warn(`  No active socket for user ${r.id} → notification NOT sent`);
                continue;
            }

            const client = Array.from(clients).find((c) => c.data.user?.ngo === true);

            if (!client) {
                this.logger.warn(
                    `  User ${r.id} has socket but community toggle = false or missing`,
                );
                this.logger.debug(
                    `  client.data.user: ${JSON.stringify(Array.from(clients)[0].data.user)}`,
                );
                continue;
            }

            this.logger.log(`  Sending notification to socket ${client.id}`);
            this.logger.log(`  User toggle: ngo = ${client.data.user?.ngo}`);

            client.emit(EVENT_TYPES.COMMUNITY_CREATE, {
                type: EVENT_TYPES.COMMUNITY_CREATE,
                title: payload.info.title,
                message: payload.info.message,
                createdAt: new Date(),
                meta: payload.meta,
            } satisfies Notification);

            this.logger.log(`EMIT SUCCESS → COMMUNITY_CREATE sent to user ${r.id}`);
        }

        this.logger.log("COMMUNITY_CREATE processing complete");
    }

    // ------listen create ngo----------------
    @OnEvent(EVENT_TYPES.NGO_CREATE)
    async handleNgoCreated(payload: Ngo) {
        this.logger.log("NGO_CREATE EVENT RECEIVED");
        this.logger.log(`Payload: ${JSON.stringify(payload, null, 2)}`);

        if (!payload.info?.recipients?.length) {
            this.logger.warn("No recipients in payload → skipping emit");
            return;
        }

        this.logger.log(`Found ${payload.info.recipients.length} recipient(s)`);

        for (const r of payload.info.recipients) {
            this.logger.log(`--- Processing recipient: ${r.id} (${r.email}) ---`);

            const clients = this.getClientsForUser(r.id);
            this.logger.log(`  → Total connected sockets for this user: ${clients.size}`);

            if (clients.size === 0) {
                this.logger.warn(`  No active socket for user ${r.id} → notification NOT sent`);
                continue;
            }

            const client = Array.from(clients).find((c) => c.data.user?.ngo === true);

            if (!client) {
                this.logger.warn(`  User ${r.id} has socket but ngo toggle = false or missing`);
                this.logger.debug(
                    `  client.data.user: ${JSON.stringify(Array.from(clients)[0].data.user)}`,
                );
                continue;
            }

            this.logger.log(`  Sending notification to socket ${client.id}`);
            this.logger.log(`  User toggle: ngo = ${client.data.user?.ngo}`);

            client.emit(EVENT_TYPES.NGO_CREATE, {
                type: EVENT_TYPES.NGO_CREATE,
                title: payload.info.title,
                message: payload.info.message,
                createdAt: new Date(),
                meta: payload.meta,
            } satisfies Notification);

            this.logger.log(`EMIT SUCCESS → ngo.create sent to user ${r.id}`);
        }

        this.logger.log("NGO_CREATE processing complete");
    }


    @OnEvent(EVENT_TYPES.POST_CREATE)
    async handlePostCreated(payload: PostEvent) {
        this.logger.log('POST_CREATE EVENT RECEIVED');
        this.logger.debug(`Payload: ${JSON.stringify(payload, null, 2)}`);

        if (!payload.info?.recipients?.length) {
            this.logger.warn('No recipients → skipping');
            return;
        }

        this.logger.log(`Sending to ${payload.info.recipients.length} follower(s)`);

        for (const r of payload.info.recipients) {
            const clients = this.getClientsForUser(r.id);

            if (clients.size === 0) {
                this.logger.debug(`No socket for user ${r.id}`);
                continue;
            }

            // The toggle check is already done in the service,
            // but we double-check the socket payload just in case.
            const client = Array.from(clients).find(c => c.data.user?.post === true);
            if (!client) {
                this.logger.debug(`User ${r.id} has socket but post toggle = false`);
                continue;
            }

            const notification: Notification = {
                type: EVENT_TYPES.POST_CREATE,
                title: payload.info.title,
                message: payload.info.message,
                createdAt: new Date(),
                meta: payload.meta,
            };

            client.emit(EVENT_TYPES.POST_CREATE, notification);
            this.logger.log(`POST_CREATE → ${r.id} (socket ${client.id})`);
        }

        this.logger.log('POST_CREATE processing complete');
    }
}
