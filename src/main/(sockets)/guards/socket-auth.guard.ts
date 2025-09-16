import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

@Injectable()
export class SocketAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token =
      client.handshake.auth?.token || client.handshake.headers?.authorization;

    if (!token) {
      throw new WsException("Unauthorized: No token provided");
    }

    try {
      // Implement your JWT validation logic here
      // const payload = await this.jwtService.verifyAsync(token);
      // client.data.user = payload;

      // For demo, we'll just check if token exists
      return !!token;
    } catch (error) {
      console.info(error);
      throw new WsException("Unauthorized: Invalid token");
    }
  }
}
