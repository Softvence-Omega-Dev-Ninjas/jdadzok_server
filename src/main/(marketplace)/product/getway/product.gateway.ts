// import { BaseSocketGateway } from "@module/(sockets)/base/abstract-socket.gateway";
// import { Injectable } from "@nestjs/common";
// import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
// import { marketplaceEvent } from "@project/main/(sockets)/@types";
// import { SOCKET_EVENTS } from "@project/main/(sockets)/constants/socket-events.constant";
// import { JwtServices } from "@project/services/jwt.service";
// import { Socket } from "socket.io";
// import { ProductService } from "../product.service";

// @WebSocketGateway(
//     {
//         namespace: "/peoducts"
//     }
// )
// @Injectable()
// export class ProductGateway extends BaseSocketGateway {
//     constructor(
//         private readonly service: ProductService,
//         jwtService: JwtServices
//     ) {
//         super(jwtService)
//     }

//     @SubscribeMessage(SOCKET_EVENTS.MARKETPLACE.CREATE_PRODUCT)
//     async handlePostCreate(
//         @ConnectedSocket() client: Socket,
//         @MessageBody() data: Omit<marketplaceEvent, "eventId">,
//     ) {
//         console.log(data)
//         if (data.content) {
//             this.service.create(data.userId, data.content)
//         }
//     }
//     protected setupRedis(): void {
//         this.logger.log("Setting up Redis for post gateway");
//     }
// }

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
