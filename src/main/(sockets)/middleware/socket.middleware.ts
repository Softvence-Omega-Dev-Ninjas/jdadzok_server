import { BadGatewayException, Injectable, Logger } from "@nestjs/common";
import { Socket } from "socket.io";
import { SocketAuthGuard } from "../guards/socket-auth.guard";
import { SocketUtils } from "../utils/socket.utils";

@Injectable()
export class SocketMiddleware {
  private readonly logger = new Logger(SocketMiddleware.name);

  // Authentication middleware
  authenticate() {
    return async (socket: Socket, next: (err?: any) => void) => {
      try {
        const user = await SocketAuthGuard.validateToken(socket);
        socket.data.user = user;
        socket.join(user.id);
        this.logger.log(`Socket ${socket.id} authenticated successfully`);
        next();
      } catch (error) {
        this.logger.error(
          `Authentication failed for socket ${socket.id}: ${error.message}`,
        );
        next(new BadGatewayException("Authentication error"));
      }
    };
  }

  // Rate limiting middleware
  rateLimit(windowMs = 1000, maxRequests = 10) {
    const requests = new Map<string, number[]>();

    return (socket: Socket, next: (err?: any) => void) => {
      const clientId = SocketUtils.getClientIP(socket);
      const now = Date.now();

      if (!requests.has(clientId)) {
        requests.set(clientId, []);
      }

      const clientRequests = requests.get(clientId)!;

      // Remove old requests outside the window
      const validRequests = clientRequests.filter(
        (time) => now - time < windowMs,
      );

      if (validRequests.length >= maxRequests) {
        return next(new Error("Rate limit exceeded"));
      }

      validRequests.push(now);
      requests.set(clientId, validRequests);

      next();
    };
  }

  // Logging middleware
  logging() {
    return (socket: Socket, next: (err?: any) => void) => {
      const ip = SocketUtils.getClientIP(socket);
      const userAgent = SocketUtils.getUserAgent(socket);

      this.logger.log(`New socket connection: ${socket.id} from ${ip}`);
      this.logger.debug(`User Agent: ${userAgent}`);

      socket.on("disconnect", (reason) => {
        this.logger.log(`Socket ${socket.id} disconnected: ${reason}`);
      });

      next();
    };
  }
}
