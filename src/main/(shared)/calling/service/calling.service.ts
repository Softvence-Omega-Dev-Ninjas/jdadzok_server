// src/call/call.service.ts
import { Injectable, Logger } from "@nestjs/common";

import { Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { PrismaService } from "@lib/prisma/prisma.service";

export interface Participant {
    socketId: string;
    userName: string;
    hasVideo: boolean;
    hasAudio: boolean;
    joinedAt: Date;
}

export interface CallRoom {
    callId: string;
    participants: Participant[];
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class CallService {
    private readonly logger = new Logger(CallService.name);
    private readonly ACTIVE_USERS_KEY = "active_users";
    private readonly CALL_ROOM_PREFIX = "call_room:";
    private readonly USER_ROOM_PREFIX = "user_room:";

    constructor(
        private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async addActiveUser(socketId: string, userId: string): Promise<void> {
        const activeUsers: Map<string, string> =
            (await this.cacheManager.get(this.ACTIVE_USERS_KEY)) || new Map();

        activeUsers.set(socketId, userId);
        await this.cacheManager.set(this.ACTIVE_USERS_KEY, activeUsers, 0);

        this.logger.log(`Added active user: ${socketId} (userId: ${userId})`);
    }

    async removeActiveUser(socketId: string): Promise<void> {
        const activeUsers: Map<string, string> =
            (await this.cacheManager.get(this.ACTIVE_USERS_KEY)) || new Map();

        activeUsers.delete(socketId);
        await this.cacheManager.set(this.ACTIVE_USERS_KEY, activeUsers, 0);

        // Clear user-room mapping
        await this.cacheManager.del(`${this.USER_ROOM_PREFIX}${socketId}`);

        this.logger.log(`Removed active user: ${socketId}`);
    }

    getActiveUsersCount(): number {
        // This would need to be async in real implementation
        return 0; // Placeholder
    }

    async joinCall(
        callId: string,
        socketId: string,
        userName: string,
        hasVideo: boolean,
        hasAudio: boolean,
    ): Promise<CallRoom> {
        const cacheKey = `${this.CALL_ROOM_PREFIX}${callId}`;

        let room: CallRoom | undefined = await this.cacheManager.get(cacheKey);

        if (!room) {
            // Create new room in cache
            room = {
                callId,
                participants: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Create or get call in database
            await this.prisma.calling.upsert({
                where: { id: callId },
                update: {
                    status: "ACTIVE",
                    startedAt: new Date(),
                    updatedAt: new Date(),
                },
                create: {
                    id: callId,
                    hostUserId: socketId,
                    status: "ACTIVE",
                    startedAt: new Date(),
                },
            });
        }

        // Add participant
        const participant: Participant = {
            socketId,
            userName,
            hasVideo,
            hasAudio,
            joinedAt: new Date(),
        };

        room.participants = [
            ...room.participants.filter((p) => p.socketId !== socketId),
            participant,
        ];
        room.updatedAt = new Date();

        // Save to cache
        await this.cacheManager.set(cacheKey, room, 0);

        // Map user to room
        await this.cacheManager.set(`${this.USER_ROOM_PREFIX}${socketId}`, callId, 0);

        // Create participant record in database
        await this.prisma.callParticipant.create({
            data: {
                callId,
                socketId,
                userName,
                hasVideo,
                hasAudio,
            },
        });

        this.logger.log(
            `User ${socketId} joined call ${callId}. Total participants: ${room.participants.length}`,
        );

        return room;
    }

    async leaveCall(socketId: string, callId: string): Promise<CallRoom | null> {
        const cacheKey = `${this.CALL_ROOM_PREFIX}${callId}`;
        const room: CallRoom | undefined = await this.cacheManager.get(cacheKey);

        if (!room) {
            return null;
        }

        // Remove participant
        room.participants = room.participants.filter((p) => p.socketId !== socketId);
        room.updatedAt = new Date();

        if (room.participants.length > 0) {
            await this.cacheManager.set(cacheKey, room, 0);
        } else {
            await this.cacheManager.del(cacheKey);
        }

        // Clear user-room mapping
        await this.cacheManager.del(`${this.USER_ROOM_PREFIX}${socketId}`);

        // Update database
        await this.prisma.callParticipant.updateMany({
            where: {
                callId,
                socketId,
                leftAt: null,
            },
            data: {
                leftAt: new Date(),
            },
        });

        this.logger.log(
            `User ${socketId} left call ${callId}. Remaining participants: ${room.participants.length}`,
        );

        return room;
    }

    async updateMediaState(
        socketId: string,
        callId: string,
        mediaType: "video" | "audio",
        enabled: boolean,
    ): Promise<void> {
        const cacheKey = `${this.CALL_ROOM_PREFIX}${callId}`;
        const room: CallRoom | undefined = await this.cacheManager.get(cacheKey);

        if (!room) {
            this.logger.warn(`Room ${callId} not found in cache`);
            return;
        }

        const participant = room.participants.find((p) => p.socketId === socketId);

        if (!participant) {
            this.logger.warn(`Participant ${socketId} not found in room ${callId}`);
            return;
        }

        if (mediaType === "video") {
            participant.hasVideo = enabled;
        } else {
            participant.hasAudio = enabled;
        }

        room.updatedAt = new Date();
        await this.cacheManager.set(cacheKey, room, 0);

        // Update database (optional - for analytics)
        await this.prisma.callParticipant.updateMany({
            where: {
                callId,
                socketId,
                leftAt: null,
            },
            data: {
                hasVideo: mediaType === "video" ? enabled : undefined,
                hasAudio: mediaType === "audio" ? enabled : undefined,
            },
        });
    }

    async getUserRoom(socketId: string): Promise<string | null> {
        const result = await this.cacheManager.get(`${this.USER_ROOM_PREFIX}${socketId}`);
        return typeof result === "string" ? result : null;
    }

    async getCallRoom(callId: string): Promise<CallRoom | null> {
        const cacheKey = `${this.CALL_ROOM_PREFIX}${callId}`;
        const result = await this.cacheManager.get(cacheKey);
        return result && typeof result === "object" && "callId" in result
            ? (result as CallRoom)
            : null;
    }

    async deleteCall(callId: string): Promise<void> {
        const cacheKey = `${this.CALL_ROOM_PREFIX}${callId}`;
        await this.cacheManager.del(cacheKey);

        // Update database
        await this.prisma.calling.update({
            where: { id: callId },
            data: {
                status: "END",
                endedAt: new Date(),
            },
        });

        this.logger.log(`Call ${callId} deleted`);
    }

    async createCall(hostUserId: string): Promise<any> {
        return await this.prisma.calling.create({
            data: {
                hostUserId,
                status: "CALLING",
            },
        });
    }

    async getCallById(callId: string): Promise<any> {
        return await this.prisma.calling.findUnique({
            where: { id: callId },
            include: {
                host: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                participants: {
                    where: {
                        leftAt: null,
                    },
                },
            },
        });
    }

    async getCallHistory(userId: string): Promise<any[]> {
        return await this.prisma.calling.findMany({
            where: {
                OR: [
                    { hostUserId: userId },
                    {
                        participants: {
                            some: {
                                socketId: userId,
                            },
                        },
                    },
                ],
            },
            include: {
                host: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                participants: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 50,
        });
    }
}
