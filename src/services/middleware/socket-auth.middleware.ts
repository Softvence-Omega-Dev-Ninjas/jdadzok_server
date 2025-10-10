// import {
//   BadGatewayException,
//   Injectable,
//   UnauthorizedException,
// } from "@nestjs/common";
// import { SocketMiddleware } from "@app/main/(sockets)/middleware/socket.middleware";
// import { JwtServices } from "@app/services/jwt.service";
// import { Socket } from "socket.io";

// @Injectable()
// export class SocketAuthMiddleware {
//   constructor(private authService: JwtServices, private readonly socketMiddleware: SocketMiddleware) {}

//   async use(socket: Socket, next: (err?: any) => void) {
//     this.socketMiddleware.authenticate()()
// }
