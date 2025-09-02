import { ENVEnum } from "@common/enum/env.enum";
import { createClient } from "@keyv/redis";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createAdapter } from "@socket.io/redis-adapter";
import chalk from "chalk";
import { Server, Socket } from "socket.io";
import { SocketPayload } from "../@types/socket.type";
import { socketServerConfig } from "./configs";

@Injectable()
export class SharedSocketService implements OnModuleInit {
  private io: Server;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.io = new Server(socketServerConfig);

    // redis pub/sub for horizontal scaling
    const pubClient = createClient({
      url: this.configService.getOrThrow<string>(ENVEnum.REDIS_URL),
    });
    const subClient = pubClient.duplicate();

    await pubClient.connect();
    await subClient.connect();

    this.io.adapter(createAdapter(pubClient, subClient));

    this.io.on("connection", (socket) => {
      console.info(chalk.bgGreen.white.bold("🫴 Socket connected ", socket.id));
      this.registerDefaultHandlers(socket);
    });
  }

  private registerDefaultHandlers(socket: Socket) {
    socket.on("disconnect", () => {
      console.info(chalk.bgGreen.white.bold("🔴 Disconnected:", socket.id));
    });
  }

  /** multi purpose emit */
  emit = <E extends string, T = any>(event: E, payload: SocketPayload<T>) => {
    if (payload.to) {
      const receivers = Array.isArray(payload.to) ? payload.to : [payload.to];

      receivers.forEach((id) => this.io.to(id).emit(event, payload));
    } else if (payload.roomId) {
      this.io.to(payload.roomId).emit(event, payload);
    } else {
      this.io.emit(event, payload);
    }
  };

  /** multi purpose listener  */
  on<T = any>(
    event: string,
    handler: (payload: SocketPayload<T>, socket: Socket) => void,
  ) {
    this.io.on("connection", (socket) => {
      socket.on(event, (payload: SocketPayload<T>) => handler(payload, socket));
    });
  }

  get server() {
    return this.io;
  }
}
