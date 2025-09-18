import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class SocketAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== "ws") return true;

    const client: Socket = context.switchToWs().getClient();
    console.info("=================cookie: ", client.handshake.headers.cookie);
    console.info("=================headers: ", client.handshake.auth);
    const auth = client.handshake.auth ?? client.handshake.headers;
    console.info(auth);

    // console.log('auth', auth)
    return true;
  }
}
