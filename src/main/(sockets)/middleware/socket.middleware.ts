// import { AuthValidatorService } from "@global/auth-validator/auth-validator.service";
import { Injectable, Logger } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class SocketMiddleware {
    private readonly logger = new Logger(SocketMiddleware.name);

    // constructor(private readonly authValidator: AuthValidatorService) { }

    authenticate() {
        return async (socket: Socket, next: (err?: any) => void) => {
            // try {
            //     const user = await this.authValidator.validateSocketToken(socket);
            //     socket.data.user = user;
            //     socket.join(user.id);

            //     this.logger.log(`✅ Socket ${socket.id} authenticated as user ${user.id}`);
            //     next();
            // } catch (error) {
            //     this.logger.error(`❌ Auth failed for socket ${socket.id}: ${error.message}`);
            //     next(new Error("Socket authentication failed"));
            // }
            next();
        };
    }

    logging() {
        return (socket: Socket, next: (err?: any) => void) => {
            const ip = socket.handshake.address || "unknown";
            const ua = socket.handshake.headers["user-agent"] || "unknown";

            this.logger.log(`📡 New connection ${socket.id} from IP ${ip}`);
            this.logger.debug(`🧭 User-Agent: ${ua}`);

            socket.on("disconnect", (reason) => {
                this.logger.log(`🔌 Disconnected: ${socket.id}, Reason: ${reason}`);
            });

            next();
        };
    }
}
