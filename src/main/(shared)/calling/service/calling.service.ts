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
    private readonly CALL_ROOM_PREFIX = "call_room:";
    private readonly USER_ROOM_PREFIX = "user_room:";
    private readonly CALL_LOCK_PREFIX = "call_lock:";
    private readonly CACHE_TTL = 3600 * 24; // 24 hours

    constructor(
        private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    /**
     * Join a call room
     */
    async joinCall(
        callId: string,
        socketId: string,
        userName: string,
        hasVideo: boolean,
        hasAudio: boolean,
        userId?: string,
    ): Promise<CallRoom> {
        const cacheKey = `${this.CALL_ROOM_PREFIX}${callId}`;

        try {
            // Get or create room from cache
            let room: CallRoom | undefined = await this.cacheManager.get(cacheKey);

            if (!room) {
                // Create new room
                room = {
                    callId,
                    participants: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                // Ensure call exists in database
                try {
                    await this.prisma.calling.upsert({
                        where: { id: callId },
                        update: {
                            status: "ACTIVE",
                            updatedAt: new Date(),
                        },
                        create: {
                            id: callId,
                            hostUserId: userId || socketId, // Use userId if available
                            status: "ACTIVE",
                            startedAt: new Date(),
                        },
                    });
                } catch (dbError) {
                    this.logger.error(`Database error creating call ${callId}:`, dbError);
                    // Continue anyway - cache-based operation can proceed
                }
            }

            // Remove any existing participant with same socketId (reconnection case)
            room.participants = room.participants.filter((p) => p.socketId !== socketId);

            // Add new participant
            const participant: Participant = {
                socketId,
                userName,
                hasVideo,
                hasAudio,
                joinedAt: new Date(),
            };

            room.participants.push(participant);
            room.updatedAt = new Date();

            // Save to cache with TTL
            await this.cacheManager.set(cacheKey, room, this.CACHE_TTL);

            // Map socket to room
            await this.cacheManager.set(
                `${this.USER_ROOM_PREFIX}${socketId}`,
                callId,
                this.CACHE_TTL
            );

            // Create participant record in database (best effort)
            try {
                // Check if participant already exists
                const existingParticipant = await this.prisma.callParticipant.findFirst({
                    where: {
                        callId,
                        socketId,
                        leftAt: null,
                    },
                });

                if (!existingParticipant) {
                    await this.prisma.callParticipant.create({
                        data: {
                            callId,
                            socketId,
                            userName,
                            hasVideo,
                            hasAudio,
                        },
                    });
                }
            } catch (dbError) {
                this.logger.warn(`Failed to create participant record: ${dbError.message}`);
                // Don't fail the join operation
            }

            this.logger.log(
                `User ${socketId} (${userName}) joined call ${callId}. Total: ${room.participants.length}`,
            );

            return room;
        } catch (error) {
            this.logger.error(`Error in joinCall: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Leave a call room
     */
    async leaveCall(socketId: string, callId: string): Promise<CallRoom | null> {
        const cacheKey = `${this.CALL_ROOM_PREFIX}${callId}`;

        try {
            const room: CallRoom | undefined = await this.cacheManager.get(cacheKey);

            if (!room) {
                this.logger.warn(`Room ${callId} not found when ${socketId} tried to leave`);
                return null;
            }

            // Remove participant
            const participantName = room.participants.find(p => p.socketId === socketId)?.userName;
            room.participants = room.participants.filter((p) => p.socketId !== socketId);
            room.updatedAt = new Date();

            // Update cache
            if (room.participants.length > 0) {
                await this.cacheManager.set(cacheKey, room, this.CACHE_TTL);
            } else {
                // Remove empty room from cache
                await this.cacheManager.del(cacheKey);
            }

            // Clear user-room mapping
            await this.cacheManager.del(`${this.USER_ROOM_PREFIX}${socketId}`);

            // Update database (best effort)
            try {
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
            } catch (dbError) {
                this.logger.warn(`Failed to update participant leave time: ${dbError.message}`);
            }

            this.logger.log(
                `User ${socketId} (${participantName}) left call ${callId}. Remaining: ${room.participants.length}`,
            );

            return room;
        } catch (error) {
            this.logger.error(`Error in leaveCall: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Update media state for a participant
     */
    async updateMediaState(
        socketId: string,
        callId: string,
        mediaType: "video" | "audio",
        enabled: boolean,
    ): Promise<void> {
        const cacheKey = `${this.CALL_ROOM_PREFIX}${callId}`;

        try {
            const room: CallRoom | undefined = await this.cacheManager.get(cacheKey);

            if (!room) {
                this.logger.warn(`Room ${callId} not found for media update`);
                return;
            }

            const participant = room.participants.find((p) => p.socketId === socketId);

            if (!participant) {
                this.logger.warn(`Participant ${socketId} not found in room ${callId}`);
                return;
            }

            // Update participant state
            if (mediaType === "video") {
                participant.hasVideo = enabled;
            } else {
                participant.hasAudio = enabled;
            }

            room.updatedAt = new Date();
            await this.cacheManager.set(cacheKey, room, this.CACHE_TTL);

            // Update database (best effort, for analytics)
            try {
                const updateData: any = {};
                if (mediaType === "video") {
                    updateData.hasVideo = enabled;
                } else {
                    updateData.hasAudio = enabled;
                }

                await this.prisma.callParticipant.updateMany({
                    where: {
                        callId,
                        socketId,
                        leftAt: null,
                    },
                    data: updateData,
                });
            } catch (dbError) {
                this.logger.warn(`Failed to update media state in DB: ${dbError.message}`);
            }

            this.logger.debug(
                `Updated ${mediaType} to ${enabled} for ${socketId} in call ${callId}`,
            );
        } catch (error) {
            this.logger.error(`Error updating media state: ${error.message}`, error.stack);
        }
    }

    /**
     * Get the room a user is currently in
     */
    async getUserRoom(socketId: string): Promise<string | null> {
        try {
            const result = await this.cacheManager.get(`${this.USER_ROOM_PREFIX}${socketId}`);
            return typeof result === "string" ? result : null;
        } catch (error) {
            this.logger.error(`Error getting user room: ${error.message}`);
            return null;
        }
    }

    /**
     * Get call room details
     */
    async getCallRoom(callId: string): Promise<CallRoom | null> {
        try {
            const cacheKey = `${this.CALL_ROOM_PREFIX}${callId}`;
            const result = await this.cacheManager.get(cacheKey);

            if (result && typeof result === "object" && "callId" in result) {
                return result as CallRoom;
            }

            return null;
        } catch (error) {
            this.logger.error(`Error getting call room: ${error.message}`);
            return null;
        }
    }

    /**
     * Delete a call room
     */
    async deleteCall(callId: string): Promise<void> {
        try {
            const cacheKey = `${this.CALL_ROOM_PREFIX}${callId}`;
            await this.cacheManager.del(cacheKey);

            // Update database
            try {
                await this.prisma.calling.update({
                    where: { id: callId },
                    data: {
                        status: "END",
                        endedAt: new Date(),
                    },
                });
            } catch (dbError) {
                // Call might not exist in DB, that's ok
                this.logger.debug(`Could not update call status in DB: ${dbError.message}`);
            }

            this.logger.log(`Call ${callId} deleted`);
        } catch (error) {
            this.logger.error(`Error deleting call: ${error.message}`);
        }
    }

    /**
     * Create a new call
     */
    async createCall(userId: string): Promise<any> {
        try {
            return await this.prisma.calling.create({
                data: {
                    hostUserId: userId,
                    status: "CALLING",
                },
            });
        } catch (error) {
            this.logger.error(`Error creating call: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Get call by ID with participants
     */
    async getCallById(callId: string): Promise<any> {
        try {
            const call = await this.prisma.calling.findUnique({
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

            // Also get active participants from cache
            if (call) {
                const cachedRoom = await this.getCallRoom(callId);
                if (cachedRoom) {
                    (call as any).activeParticipants = cachedRoom.participants;
                }
            }

            return call;
        } catch (error) {
            this.logger.error(`Error getting call by ID: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get call history for a user
     */
    async getCallHistory(userId: string, limit: number = 50): Promise<any[]> {
        try {
            return await this.prisma.calling.findMany({
                where: {
                    hostUserId: userId,
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
                    participants: {
                        orderBy: {
                            joinedAt: "desc",
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: limit,
            });
        } catch (error) {
            this.logger.error(`Error getting call history: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get active calls count
     */
    async getActiveCallsCount(): Promise<number> {
        try {
            // This would require scanning cache keys or maintaining a counter
            // For now, query database
            const count = await this.prisma.calling.count({
                where: {
                    status: "ACTIVE",
                },
            });
            return count;
        } catch (error) {
            this.logger.error(`Error getting active calls count: ${error.message}`);
            return 0;
        }
    }

    /**
     * Clean up stale call rooms (run periodically)
     */
    async cleanupStaleRooms(): Promise<void> {
        try {
            // This would require implementing cache key scanning
            // For now, focus on database cleanup
            const staleTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

            await this.prisma.calling.updateMany({
                where: {
                    status: "ACTIVE",
                    updatedAt: {
                        lt: staleTime,
                    },
                },
                data: {
                    status: "END",
                    endedAt: new Date(),
                },
            });

            this.logger.log("Cleaned up stale rooms");
        } catch (error) {
            this.logger.error(`Error cleaning up stale rooms: ${error.message}`);
        }
    }
}