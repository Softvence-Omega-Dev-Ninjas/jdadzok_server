// import { RedisService } from "@common/redis/redis.service";
// import {
//   ConnectedSocket,
//   MessageBody,
//   SubscribeMessage,
//   WebSocketGateway,
// } from "@nestjs/websockets";
// import { SocketAuthMiddleware } from "@project/services/middleware/socket-auth.middleware";
// import { Socket } from "socket.io";
// import { PostService } from "../posts.service";

// enum PostEvents {
//   CREATE_POST = "CREATE_POST",
//   NEW_POST = "NEW_POST",
//   LIKE_POST = "LIKE_POST",
//   POST_LIKED = "POST_LIKED",
// }

// @WebSocketGateway({ namespace: "/posts", middleware: [SocketAuthMiddleware] })
// export class PostGateway {
//   constructor(
//     private postService: PostService,
//     private redisService: RedisService,
//   ) {}

//   @SubscribeMessage(PostEvents.CREATE_POST)
//   async handleCreate(
//     @MessageBody() data: any,
//     @ConnectedSocket() socket: Socket,
//   ) {
//     // const post = await this.postService.(socket.data.user.id, data); // Prisma create
//     // this.server.emit(PostEvents.NEW_POST, post); // Broadcast to all (or to followers via rooms)
//     // await this.redisService.publish('posts_channel', JSON.stringify(post)); // For cross-instance if needed
//   }

//   // @SubscribeMessage(PostEvents.LIKE_POST)
//   // async handleLike(@MessageBody() dto: LikePostDto) {
//   //     const like = await this.postService.likePost(dto.postId, dto.userId); // Prisma update
//   //     this.server.to(`post-${dto.postId}`).emit(PostEvents.POST_LIKED, like); // Room per post
//   //     // Cache like count in Redis for quick reads
//   //     await this.redisService.set(`post:${dto.postId}:likes`, like.count.toString(), 60); // TTL 1min
//   // }
// }
