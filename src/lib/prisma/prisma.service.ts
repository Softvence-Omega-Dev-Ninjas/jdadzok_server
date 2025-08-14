import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import chalk from 'chalk';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error'>
  implements OnModuleInit, OnModuleDestroy
{
  // * Expose Prisma utils (enums, filters, etc.)
  readonly utils = Prisma;

  constructor() {
    super({
      log: [{ emit: 'event', level: 'error' }],
    });
  }

  async onModuleInit() {
    console.info(chalk.bgGreen.white.bold('🚀 Prisma connected'));
    await this.$connect();
  }

  async onModuleDestroy() {
    console.info(chalk.bgRed.white.bold('🚫 Prisma disconnected'));
    await this.$disconnect();
  }
}
