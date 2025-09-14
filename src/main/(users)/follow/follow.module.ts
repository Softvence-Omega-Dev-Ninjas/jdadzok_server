import { Module } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { FollowRepository } from "./follow.repository";

@Module({
  imports: [],
  providers: [PrismaService, FollowRepository],
  exports: [FollowRepository],
})
export class FollowModule {}
