import * as dotenv from "dotenv";
import { ServerOptions } from "socket.io";
import { origin } from "./allow.origin";

dotenv.config();

export const socketServerConfig: Partial<ServerOptions> = {
  cors: {
    origin: process.env.NODE_ENV === "development" ? "*" : origin,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT"],
  },
  // adapter: //TODO: adapter will add letter
  cookie: true,
  transports: ["webtransport", "websocket"],
};
