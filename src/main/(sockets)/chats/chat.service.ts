import { PrismaService } from "@lib/prisma/prisma.service";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import { LiveChat } from "@prisma/client";
import { CreateMessageDto } from "./dto/create.message.dto";

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    /** Find or create 1-to-1 chat */
    async getOrCreatePrivateChat(userA: string, userB: string): Promise<LiveChat> {
        const existing = await this.prisma.liveChat.findFirst({
            where: {
                type: "INDIVIDUAL",
                participants: {
                    every: {
                        userId: { in: [userA, userB] },
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                profile: { select: { name: true, avatarUrl: true } },
                            },
                        },
                    },
                },
            },
        });

        // Verify it's actually a 1-to-1 between these exact users
        if (existing) {
            const participantIds = existing.participants.map((p) => p.userId).sort();
            const expectedIds = [userA, userB].sort();

            if (JSON.stringify(participantIds) === JSON.stringify(expectedIds)) {
                return existing;
            }
        }

        return this.prisma.$transaction(async (tx) => {
            const chat = await tx.liveChat.create({
                data: {
                    type: "INDIVIDUAL",
                    createdById: userA,
                },
            });

            const participants =
                userA === userB
                    ? [{ chatId: chat.id, userId: userA }]
                    : [
                          { chatId: chat.id, userId: userA },
                          { chatId: chat.id, userId: userB },
                      ];

            await tx.liveChatParticipant.createMany({ data: participants });

            const result = await tx.liveChat.findUnique({
                where: { id: chat.id },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                    profile: { select: { name: true, avatarUrl: true } },
                                },
                            },
                        },
                    },
                },
            });

            if (!result) {
                throw new Error("Failed to create chat");
            }

            return result;
        });
    }

    /** Get chat by ID with verification */
    async getChatById(chatId: string, userId: string) {
        const chat = await this.prisma.liveChat.findUnique({
            where: { id: chatId },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                profile: { select: { name: true, avatarUrl: true } },
                            },
                        },
                    },
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                profile: { select: { name: true, avatarUrl: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!chat) {
            throw new NotFoundException("Chat not found");
        }

        // Verify user is a participant
        const isParticipant = chat.participants.some((p) => p.userId === userId);
        if (!isParticipant) {
            throw new ForbiddenException("You are not a participant in this chat");
        }

        return chat;
    }

    /** Send message */
    async createMessage(senderId: string, chatId: string, dto: CreateMessageDto) {
        // Verify sender is participant
        const chat = await this.prisma.liveChat.findUnique({
            where: { id: chatId },
            include: { participants: true },
        });

        if (!chat) {
            throw new NotFoundException("Chat not found");
        }

        const isParticipant = chat.participants.some((p) => p.userId === senderId);
        if (!isParticipant) {
            throw new ForbiddenException("You are not a participant in this chat");
        }

        return this.prisma.liveMessage.create({
            data: {
                chatId,
                senderId,
                content: dto.content,
                mediaUrl: dto.mediaUrl,
                mediaType: dto.mediaType,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isVerified: true,
                        profile: { select: { name: true, avatarUrl: true } },
                    },
                },
                chat: {
                    include: {
                        participants: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        role: true,
                                        isVerified: true,
                                        profile: { select: { name: true, avatarUrl: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    /** Mark message as read */
    async markRead(messageId: string, userId: string) {
        const message = await this.prisma.liveMessage.findUnique({
            where: { id: messageId },
            include: { chat: { include: { participants: true } } },
        });

        if (!message) {
            throw new NotFoundException("Message not found");
        }

        // Verify user is participant
        const isParticipant = message.chat.participants.some((p) => p.userId === userId);
        if (!isParticipant) {
            throw new ForbiddenException("You are not a participant in this chat");
        }

        return this.prisma.liveMessageRead.upsert({
            where: { messageId_userId: { messageId, userId } },
            create: {
                messageId,
                userId,
                liveChatId: message.chatId,
            },
            update: { readAt: new Date() },
        });
    }

    /** List my private chats with last message & unread count */
    async getMyChats(userId: string) {
        const chats = await this.prisma.liveChat.findMany({
            where: {
                type: "INDIVIDUAL",
                participants: { some: { userId } },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                profile: { select: { name: true, avatarUrl: true } },
                            },
                        },
                    },
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                profile: { select: { name: true, avatarUrl: true } },
                            },
                        },
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        return Promise.all(
            chats.map(async (chat) => {
                const unreadCount = await this.prisma.liveMessage.count({
                    where: {
                        chatId: chat.id,
                        senderId: { not: userId },
                        readBy: { none: { userId } },
                    },
                });

                // Find the other user in the chat
                const otherUser = chat.participants.find((p) => p.userId !== userId)?.user || null;

                return {
                    ...chat,
                    unreadCount,
                    otherUser,
                    lastMessage: chat.messages[0] || null,
                };
            }),
        );
    }

    /** Get paginated messages for a chat */
    async getMessages(chatId: string, cursor?: string, take = 20) {
        const messages = await this.prisma.liveMessage.findMany({
            where: { chatId },
            orderBy: { createdAt: "desc" },
            take: take + 1, // Fetch one extra to check if there are more
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0, // Skip the cursor itself
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        profile: { select: { name: true, avatarUrl: true } },
                    },
                },
                readBy: {
                    select: {
                        userId: true,
                        readAt: true,
                    },
                },
            },
        });

        const hasMore = messages.length > take;
        const resultMessages = hasMore ? messages.slice(0, -1) : messages;

        return {
            messages: resultMessages.reverse(), // Return in ascending order (oldest first)
            hasMore,
            nextCursor: hasMore ? resultMessages[resultMessages.length - 1].id : null,
        };
    }

    /** Get unread message count for a specific chat */
    async getUnreadCount(chatId: string, userId: string) {
        const count = await this.prisma.liveMessage.count({
            where: {
                chatId,
                senderId: { not: userId },
                readBy: { none: { userId } },
            },
        });

        return { chatId, unreadCount: count };
    }
}
