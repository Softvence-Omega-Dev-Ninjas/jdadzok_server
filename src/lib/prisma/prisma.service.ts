import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import chalk from "chalk";

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, "query" | "error">
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  // * Expose Prisma utils (enums, filters, etc.)
  readonly utils = Prisma;

  constructor() {
    super({
      log: [{ emit: "event", level: "error" }],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log(chalk.bgGreen.white.bold("🚀 Prisma connected"));
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log(chalk.bgRed.white.bold("🚫 Prisma disconnected"));
  }
}
