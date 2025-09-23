import {
  BadGatewayException,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from "@nestjs/common";
import { Socket } from "socket.io";
import { RateLimitConfig, SocketUser } from "../@types";

export const RATE_LIMIT_KEY = "socket_rate_limit";
export const SocketRateLimit = (config: RateLimitConfig) =>
  SetMetadata(RATE_LIMIT_KEY, config);

export const GetSocketUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const client: Socket = context.switchToWs().getClient();
    const user = client.user || (client.data.user as SocketUser);
    if (!user) throw new BadGatewayException("Client user not found!");
    return user;
  },
);
