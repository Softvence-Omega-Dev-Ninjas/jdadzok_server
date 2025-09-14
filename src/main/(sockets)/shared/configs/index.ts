import { ConfigService } from "@nestjs/config";
import { ServerOptions } from "socket.io";
import { origin } from "./allow.origin";

export function createSocketConfig(
  configService: ConfigService,
): Partial<ServerOptions> {
  const env = configService.get<string>("NODE_ENV", "development");

  return {
    cors: {
      origin: env === "development" ? "*" : origin,
      credentials: true,
      methods: ["GET", "POST", "DELETE", "PUT"],
    },
    cookie: true,
    transports: ["webtransport", "websocket"],
  };
}
