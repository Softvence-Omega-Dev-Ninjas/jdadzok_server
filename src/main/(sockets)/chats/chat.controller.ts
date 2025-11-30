import { GetUser, ValidateAuth } from "@common/jwt/jwt.decorator";
import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ChatService } from "./chat.service";
import { CreateMessageDto } from "./dto/create.message.dto";
import { StartPrivateChatDto } from "./dto/start-private.dto";

@ApiTags("Chat API operations")
@ApiBearerAuth()
@Controller("chat")
export class ChatController {
    constructor(private chatService: ChatService) {}

    @Post("private")
    @ValidateAuth()
    @ApiOperation({ summary: "Start or get existing private chat with another user" })
    @ApiResponse({ status: 200, description: "Chat created or retrieved successfully" })
    @ApiResponse({ status: 404, description: "User not found" })
    async startPrivateChat(@GetUser("userId") userId: string, @Body() dto: StartPrivateChatDto) {
        return this.chatService.getOrCreatePrivateChat(userId, dto.otherUserId);
    }

    @Get("my")
    @ValidateAuth()
    @ApiOperation({ summary: "Get all my chats with unread count and last message" })
    @ApiResponse({ status: 200, description: "List of user chats with metadata" })
    async getMyChats(@GetUser("userId") userId: string) {
        return this.chatService.getMyChats(userId);
    }

    @Get(":chatId")
    @ValidateAuth()
    @ApiOperation({ summary: "Get chat details by ID" })
    @ApiResponse({ status: 200, description: "Chat details retrieved successfully" })
    @ApiResponse({ status: 404, description: "Chat not found" })
    @ApiResponse({ status: 403, description: "Not a participant in this chat" })
    async getChatById(@GetUser("userId") userId: string, @Param("chatId") chatId: string) {
        return this.chatService.getChatById(chatId, userId);
    }

    @Get(":chatId/messages")
    @ValidateAuth()
    @ApiOperation({ summary: "Get paginated messages for a specific chat" })
    @ApiResponse({ status: 200, description: "List of messages with pagination info" })
    @ApiResponse({ status: 404, description: "Chat not found" })
    async getMessages(
        @Param("chatId") chatId: string,
        @Query("cursor") cursor?: string,
        @Query("take") take?: string,
    ) {
        const takeNum = take ? parseInt(take, 10) : 20;
        return this.chatService.getMessages(chatId, cursor, takeNum);
    }

    @Post(":chatId/messages")
    @ValidateAuth()
    @ApiOperation({ summary: "Send a message in a chat" })
    @ApiResponse({ status: 201, description: "Message sent successfully" })
    @ApiResponse({ status: 404, description: "Chat not found" })
    @ApiResponse({ status: 403, description: "Not a participant in this chat" })
    async sendMessage(
        @GetUser("userId") userId: string,
        @Param("chatId") chatId: string,
        @Body() dto: CreateMessageDto,
    ) {
        return this.chatService.createMessage(userId, chatId, dto);
    }

    @Patch("messages/:messageId/read")
    @ValidateAuth()
    @ApiOperation({ summary: "Mark a message as read" })
    @ApiResponse({ status: 200, description: "Message marked as read successfully" })
    @ApiResponse({ status: 404, description: "Message not found" })
    @ApiResponse({ status: 403, description: "Not authorized to mark this message" })
    async markMessageAsRead(
        @GetUser("userId") userId: string,
        @Param("messageId") messageId: string,
    ) {
        return this.chatService.markRead(messageId, userId);
    }

    @Get(":chatId/unread-count")
    @ValidateAuth()
    @ApiOperation({ summary: "Get unread message count for a specific chat" })
    @ApiResponse({ status: 200, description: "Unread count retrieved successfully" })
    @ApiResponse({ status: 404, description: "Chat not found" })
    async getUnreadCount(@GetUser("userId") userId: string, @Param("chatId") chatId: string) {
        return this.chatService.getUnreadCount(chatId, userId);
    }
}
