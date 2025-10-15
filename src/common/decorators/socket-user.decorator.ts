import { SocketUser as TUser } from "@module/(sockets)/@types";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Socket } from "socket.io";

export const SocketUser = createParamDecorator((_: unknown, context: ExecutionContext): TUser => {
    const client: Socket = context.switchToWs().getClient();
    return client.data.user;
});
