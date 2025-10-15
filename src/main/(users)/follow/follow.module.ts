import { PrismaService } from "@lib/prisma/prisma.service";
import { Module } from "@nestjs/common";
import { FollowRepository } from "./follow.repository";

@Module({
    imports: [],
    providers: [PrismaService, FollowRepository],
    exports: [FollowRepository],
})
export class FollowModule { }
