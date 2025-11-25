import { GetSocketUser } from "@common/decorators/socket-user.decorator";
import { PrismaService } from "@lib/prisma/prisma.service";
import { UseGuards } from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
} from "@nestjs/websockets";
import { Socket } from "socket.io";
import { BaseSocketGateway } from "../base/abstract-socket.gateway";
import { SocketAuthGuard } from "../guards/socket-auth.guard";
import { SocketMiddleware } from "../middleware/socket.middleware";
import { RedisService } from "../services/redis.service";
import { ChatService } from "./chat.service";
import { CreateMessageDto } from "./dto/create.message.dto";

interface SocketUser {
    id: string;
}

@WebSocketGateway({
    cors: { origin: "*" },
    namespace: "/chat",
})
@UseGuards(SocketAuthGuard)
export class ChatGateway extends BaseSocketGateway {
    constructor(
        private chatService: ChatService,
        private prisma: PrismaService,
        redisService: RedisService,
        socketMiddleware: SocketMiddleware,
    ) {
        super(redisService, socketMiddleware);
    }

    @SubscribeMessage("chat:message_send")
    async handleMessage(
        @GetSocketUser() user: SocketUser,
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { receiverId: string } & CreateMessageDto,
    ) {
        const { receiverId } = data;

        //Find or create a chat between sender and receiver
        let chat = await this.prisma.liveChat.findFirst({
            where: {
                OR: [
                    {
                        participants: { some: { userId: user.id } },
                        AND: { participants: { some: { userId: receiverId } } },
                    },
                ],
            },
            include: { participants: { include: { user: true } } },
        });

        if (!chat) {
            chat = await this.prisma.liveChat.create({
                data: {
                    participants: {
                        create: [{ userId: user.id }, { userId: receiverId }],
                    },
                },
                include: { participants: { include: { user: true } } },
            });
        }

        //  Verify sender is indeed part of this chat
        const isParticipant = chat.participants.some((p) => p.userId === user.id);
        if (!isParticipant) {
            console.log("User not in chat:", user.id, chat.id);
            return client.emit("error", { message: "You are not in this chat" });
        }

        //  Create the message
        const message = await this.chatService.createMessage(user.id, chat.id, data);

        // Build payload
        const payload = {
            id: message.id,
            chatId: message.chatId,
            content: message.content,
            mediaUrl: message.mediaUrl,
            mediaType: message.mediaType,
            sender: message.sender, // full info from Prisma include
            receiver:
                message.chat.participants
                    .map((p) => p.user)
                    .find((u) => u.id !== message.senderId) ?? null,
            createdAt: message.createdAt,
        };

        //  Emit message to both users (sender & receiver)
        this.emitToUserViaClientsMap(receiverId, "chat:message_receive", payload);
        this.emitToUserViaClientsMap(user.id, "chat:message_sent", payload);
    }

    @SubscribeMessage("chat:message_read")
    async handleRead(
        @GetSocketUser() user: SocketUser,
        @MessageBody() { messageId }: { messageId: string },
    ) {
        await this.chatService.markRead(messageId, user.id);

        const msg = await this.prisma.liveMessage.findUnique({
            where: { id: messageId },
            select: { chatId: true, senderId: true },
        });

        if (msg && msg.senderId !== user.id) {
            this.server
                .to(msg.chatId)
                .except(user.id)
                .emit("chat:message_read", { messageId, readBy: user.id });
        }
    }
}
