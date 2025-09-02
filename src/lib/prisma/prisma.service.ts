import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import chalk from "chalk";

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, "query" | "error">
  implements OnModuleInit, OnModuleDestroy
{
  // * Expose Prisma utils (enums, filters, etc.)
  readonly utils = Prisma;

  constructor() {
    super({
      log: [{ emit: "event", level: "error" }],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.info(chalk.bgGreen.white.bold("🚀 Prisma connected"));
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.info(chalk.bgRed.white.bold("🚫 Prisma disconnected"));
  }
}
