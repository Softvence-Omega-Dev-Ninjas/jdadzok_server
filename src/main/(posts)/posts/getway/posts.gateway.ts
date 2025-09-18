import { PostComment, PostEvent, PostReaction } from "@module/(sockets)/@types";
import { BaseSocketGateway } from "@module/(sockets)/base/abstract-socket.gateway";
import { SOCKET_EVENTS } from "@module/(sockets)/constants/socket-events.constant";
import { Injectable } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { JwtServices } from "@project/services/jwt.service";
import { Socket } from "socket.io";
import { PostService } from "../posts.service";

@WebSocketGateway({
  namespace: "/posts",
})
@Injectable()
export class PostGateway extends BaseSocketGateway {
  constructor(
    private readonly postService: PostService,
    private readonly jwt: JwtServices,
  ) {
    super(jwt);
  }

  @SubscribeMessage(SOCKET_EVENTS.POST.CREATE)
  async handlePostCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PostEvent,
  ) {
    this.handleConnection(client);

    console.info(data);

    // const userId = this.getUserId(client.id);
    // if (!userId) {
    //   client.emit(
    //     SOCKET_EVENTS.ERROR.UNAUTHORIZED,
    //     this.createResponse(false, null, "User not authenticated"),
    //   );
    //   return;
    // }

    // if (
    //   !this.checkRateLimit(`post_create:${userId}`, RATE_LIMITS.POST_CREATE)
    // ) {
    //   client.emit(
    //     SOCKET_EVENTS.ERROR.RATE_LIMIT,
    //     this.createResponse(false, null, "Too many posts. Please wait."),
    //   );
    //   return;
    // }

    // const postEvent: PostEvent = {
    //   ...data,
    //   eventId: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    //   timestamp: new Date(),
    //   userId: "",
    //   action: "create",
    // };

    // Create a room for this post for comments and reactions
    // const postRoomId = `post:${data.postId}`;
    // await this.joinRoom(client, postRoomId, {
    //   name: `Post ${data.postId}`,
    //   type: "post",
    // });

    // // Broadcast new post to all users
    // this.broadcastToAll(SOCKET_EVENTS.POST.CREATE, postEvent, client.id);

    // client.emit(
    //   SOCKET_EVENTS.POST.CREATE,
    //   this.createResponse(true, postEvent),
    // );
    // this.logger.log(`Post created by user ${userId}: ${data.postId}`);
    this.logger.log(`Post created by`);
  }

  @SubscribeMessage(SOCKET_EVENTS.POST.LIKE)
  async handlePostReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: Omit<PostReaction, "eventId" | "timestamp" | "userId">,
  ) {
    const userId = this.getUserId(client.id);
    if (!userId) return;

    const reactionEvent: PostReaction = {
      ...data,
      eventId: `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId,
    };

    const postRoomId = `post:${data.postId}`;

    // Emit to post room and the post creator
    this.emitToRoom(postRoomId, SOCKET_EVENTS.POST.LIKE, reactionEvent);

    client.emit(
      SOCKET_EVENTS.POST.LIKE,
      this.createResponse(true, reactionEvent),
    );
    this.logger.log(`Post ${data.postId} ${data.action} by user ${userId}`);
  }

  @SubscribeMessage(SOCKET_EVENTS.POST.COMMENT_ADD)
  async handlePostComment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: Omit<PostComment, "eventId" | "timestamp" | "userId">,
  ) {
    const userId = this.getUserId(client.id);
    if (!userId) return;

    if (!data.content?.trim()) {
      client.emit(
        SOCKET_EVENTS.ERROR.VALIDATION,
        this.createResponse(false, null, "Comment cannot be empty"),
      );
      return;
    }

    const commentEvent: PostComment = {
      ...data,
      eventId: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId,
      action: "create",
    };

    const postRoomId = `post:${data.postId}`;

    // Join post room if not already in it
    await this.joinRoom(client, postRoomId, {
      name: `Post ${data.postId}`,
      type: "post",
    });

    this.emitToRoom(
      postRoomId,
      SOCKET_EVENTS.POST.COMMENT_ADD,
      commentEvent,
      client.id,
    );

    client.emit(
      SOCKET_EVENTS.POST.COMMENT_ADD,
      this.createResponse(true, commentEvent),
    );
    this.logger.log(`Comment added to post ${data.postId} by user ${userId}`);
  }
}
