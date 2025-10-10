import { SocketUser } from "@app/main/(sockets)/@types";

declare module "socket.io" {
    interface Socket {
        user?: SocketUser;
    }
}
