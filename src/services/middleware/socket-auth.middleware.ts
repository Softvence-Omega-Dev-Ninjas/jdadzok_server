import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtServices } from "@project/services/jwt.service";
import { Socket } from "socket.io";

@Injectable()
export class SocketAuthMiddleware {
  constructor(private authService: JwtServices) {}

  async use(socket: Socket, next: (err?: any) => void) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token; // Pass token from client
      if (!token) throw new UnauthorizedException("Missing auth token");

      const user = await this.authService.verifyAsync(token);
      if (!user)
        throw new BadGatewayException("Unable to connnect to the socket");

      console.info("user: ", user);
      socket.data.user = user;
      socket.join(user.sub);

      next();
    } catch (err: any) {
      console.info(err);
      next(new UnauthorizedException("Invalid or expired token"));
    }
  }
}
