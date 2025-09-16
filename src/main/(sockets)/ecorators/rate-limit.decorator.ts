import { SetMetadata } from "@nestjs/common";
import { RateLimitConfig } from "../@types";

export const RATE_LIMIT_KEY = "socket_rate_limit";
export const SocketRateLimit = (config: RateLimitConfig) =>
  SetMetadata(RATE_LIMIT_KEY, config);
