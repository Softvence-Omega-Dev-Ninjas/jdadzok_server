import { BaseSocketGateway } from "@module/(sockets)/base/abstract-socket.gateway";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { marketplaceEvent } from "@project/main/(sockets)/@types";
import { SOCKET_EVENTS } from "@project/main/(sockets)/constants/socket-events.constant";
import { Socket } from "socket.io";

@WebSocketGateway()
export class ProductGateway extends BaseSocketGateway {
  @SubscribeMessage(SOCKET_EVENTS.MARKETPLACE.CREATE_PRODUCT)
  async handlePostCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: Omit<marketplaceEvent, "eventId">,
  ) {
    console.info(client.handshake.headers);
    console.info(data);
  }
  protected setupRedis(): void {
    this.logger.log("Setting up Redis for post gateway");
  }
}
