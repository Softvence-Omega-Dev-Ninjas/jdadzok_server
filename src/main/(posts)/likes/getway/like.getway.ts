import { SocketUser } from "@module/(sockets)/@types";
import { BaseSocketGateway } from "@module/(sockets)/base/abstract-socket.gateway";
import { GetSocketUser } from "@module/(sockets)/ecorators/rate-limit.decorator";
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
    try {
      const like = await this.likeService.likePost(user.id, body);
      console.info("postlike: ", like);
      this.server.emit(SOCKET_LIKE_EVENT.LIKE, {
        message: "Post like created",
      });
    } catch (err) {
      return err;
    }
  }
  @SubscribeMessage(SOCKET_LIKE_EVENT.DISLIKE)
  async handleDislike(
    @GetSocketUser() user: SocketUser,
    @MessageBody() body: UpdateLikeDto,
  ) {
    console.info(user);
    console.info(body);
  }
}
