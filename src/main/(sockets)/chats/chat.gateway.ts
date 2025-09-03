import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { Socket } from "socket.io";
import { SocketAuthMiddleware } from "../../../services/middleware/socket-auth.middleware";
import { ChatService } from "./chat.service";
import { CreateMessageDto } from "./dto/create.message.dto";

@WebSocketGateway({ namespace: "/chat", middleware: [SocketAuthMiddleware] })
export class ChatGateway {
  constructor(private chatService: ChatService) {}

  @SubscribeMessage(ChatEvents.SEND_MESSAGE)
  async handleMessage(
    @MessageBody() dto: CreateMessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const message = await this.chatService.createMessage(
      socket.data.user.id,
      dto,
    ); // Use Prisma to save
    const room = `p2p-${[dto.fromUserId, dto.toUserId].sort().join("-")}`; // Unique P2P room
    socket.to(room).emit(ChatEvents.RECEIVE_MESSAGE, message); // Broadcast via room
  }

  @SubscribeMessage(ChatEvents.JOIN_P2P)
  handleJoinP2P(
    @MessageBody("peerId") peerId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const room = `p2p-${socket.data.user.id}-${peerId}`;
    socket.join(room);
    // Notify peer via Redis pub/sub if needed for cross-instance
  }

  @SubscribeMessage(ChatEvents.SIGNAL)
  handleSignal(@MessageBody() signal: any, @ConnectedSocket() socket: Socket) {
    // Forward WebRTC signal (offer/answer/ICE) to peer's room
    socket.to(signal.room).emit("signal", signal.data);
  }
}
