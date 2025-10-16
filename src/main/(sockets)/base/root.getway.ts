import { GetSocketUser } from "@common/decorators/socket-user.decorator";
import { Injectable } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { SocketUser } from "../@types";
import { BaseSocketGateway } from "./abstract-socket.gateway";

@Injectable()
@WebSocketGateway()
export class RootGetway extends BaseSocketGateway {
    @SubscribeMessage("hello")
    async handleHello(@GetSocketUser() user: SocketUser, client: Socket, @MessageBody() payload: any) {
        console.log('user: ', user)
        console.log('client id: ', client.id)
        console.log('payload: ', payload)
    }
}