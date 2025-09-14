import { Module } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { HideController } from "./hide.controller";
import { HideService } from "./hide.service";

@Module({
  controllers: [HideController],
  providers: [HideService, PrismaService],
})
export class HideModule {}
