import { BaseSocketGateway } from "@module/(sockets)/base/abstract-socket.gateway";
import { WebSocketGateway } from "@nestjs/websockets";
import { LikeService } from "../like.service";
import { SocketMiddleware } from "@project/main/(sockets)/middleware/socket.middleware";

@WebSocketGateway({
  namespace: "like",
})
export class LikeGetway extends BaseSocketGateway {
  constructor(
    private readonly likeService: LikeService,
    private readonly sockMiddleare: SocketMiddleware,
  ) {
    super(sockMiddleare);
  }
}
