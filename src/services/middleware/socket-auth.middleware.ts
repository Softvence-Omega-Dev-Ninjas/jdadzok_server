import { BadGatewayException, Injectable } from "@nestjs/common";
import { JwtServices } from "@project/services/jwt.service";
import { Socket } from "socket.io";

@Injectable()
export class SocketAuthMiddleware {
  constructor(private authService: JwtServices) {}

  use(socket: Socket, next: (err?: any) => void) {
    const token = socket.handshake.auth.token; // Pass token from client
    if (!token) return next(new Error("Authentication error"));

    const user = this.authService.verifyAsync(token);
    if (!user)
      throw new BadGatewayException("Unable to connnect to the socket");
    socket.data.user = user; // Attach user to socket for later use
    return next();
  }
}
