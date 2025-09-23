import { SocketUser } from "@module/(sockets)/@types";
import { BaseSocketGateway } from "@module/(sockets)/base/abstract-socket.gateway";
import { GetSocketUser } from "@module/(sockets)/ecorators/rate-limit.decorator";
import { BadGatewayException } from "@nestjs/common";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { JwtServices } from "@project/services/jwt.service";
import { CreateLikeDto, UpdateLikeDto } from "../dto/creaete.like.dto";
import { SOCKET_LIKE_EVENT } from "../events";
import { LikeService } from "../like.service";

@WebSocketGateway({
  namespace: "posts/like",
})
export class LikeGetway extends BaseSocketGateway {
  constructor(
    private readonly likeService: LikeService,
    private readonly jwtServices: JwtServices,
  ) {
    super(jwtServices);
  }
  @SubscribeMessage(SOCKET_LIKE_EVENT.LIKE)
  async handleLike(
    @GetSocketUser() user: SocketUser,
    @MessageBody() body: CreateLikeDto,
  ) {
    if (!body.postId)
      throw new BadGatewayException("PostID is required to like a post!");
    try {
      const like = await this.likeService.likePost(user.id, body);
      console.info("postlike: ", like);
      // send notificaiton the the owner of the post && if owner not in online then send a mail to the user
      // and broadcast the event for the all tagged user
    } catch (err) {
      return err;
    }
  }
  @SubscribeMessage(SOCKET_LIKE_EVENT.DISLIKE)
  async handleDislike(
    @GetSocketUser() user: SocketUser,
    @MessageBody() body: UpdateLikeDto,
  ) {
    if (!body.postId)
      throw new BadGatewayException("PostID is required to like a post!");
    try {
      const disLike = await this.likeService.likePost(user.id, {
        postId: body.postId!,
        userId: user.id,
      });
      console.info("postdisLike: ", disLike);
      // send notificaiton the the owner of the post && if owner not in online then send a mail to the user
      // and broadcast the event for the all tagged user
    } catch (err) {
      return err;
    }
  }
}
