import { Injectable } from "@nestjs/common";
import { SocketPayload } from "@project/main/(sockets)/@types/socket.type";
import { OnSocketEvent } from "@project/main/(sockets)/decorators";

@Injectable()
export class NotificationGateway {
  @OnSocketEvent("notification:new")
  async handleNotificaiton(payload: SocketPayload<{ message: string }>) {
    // console.log("New notification:", payload[]);
  }
}
