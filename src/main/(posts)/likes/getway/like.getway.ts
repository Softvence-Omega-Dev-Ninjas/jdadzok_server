import { BaseSocketGateway } from "@module/(sockets)/base/abstract-socket.gateway";
import { WebSocketGateway } from "@nestjs/websockets";
import { JwtServices } from "@project/services/jwt.service";
import { LikeService } from "../like.service";

@WebSocketGateway({
  namespace: "like",
})
export class LikeGetway extends BaseSocketGateway {
  constructor(
    private readonly likeService: LikeService,
    private readonly jwtServices: JwtServices,
  ) {
    super(jwtServices);
  }
}
