import { SocketUser } from "@project/main/(sockets)/@types";

declare module "socket.io" {
    interface Socket {
        user?: SocketUser;
    }
}
