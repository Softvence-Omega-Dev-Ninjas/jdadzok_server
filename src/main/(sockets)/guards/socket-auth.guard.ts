import {
  BadGatewayException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { JwtServices } from "@project/services/jwt.service";
import { Socket } from "socket.io";
import { SocketUser } from "../@types";

@Injectable()
export class SocketAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== "ws") return true;

    const client: Socket = context.switchToWs().getClient();
    const user = await SocketAuthGuard.validateToken(client);

    const socketUser: SocketUser = {
      id: user.id,
      role: user.role,
      socketId: client.id,
      joinedAt: new Date(),
      status: "away",
      email: user.email,
    };
    client.user = socketUser;
    client.data = socketUser;
    return true;
  }

  public static async validateToken(client: Socket) {
    const token =
      client.handshake.headers.cookie ?? client.handshake.headers.cookie;

    if (!token)
      throw new BadGatewayException("Unauthorized user - token not found");

    const jwt = new JwtService();
    const configService = new ConfigService();
    const jwtService = new JwtServices(jwt, configService);
    const isVerifiedToken = await jwtService.verifyAsync(token);
    if (!isVerifiedToken?.email)
      throw new BadGatewayException("Invalid token, unauthorized");

    const prisma = new PrismaService();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: isVerifiedToken.sub }, { email: isVerifiedToken.email }],
      },
    });
    if (!user) throw new BadGatewayException("User not found");

    if (!user.isVerified)
      throw new UnauthorizedException("Please verify your account first");

    return user;
  }
}
