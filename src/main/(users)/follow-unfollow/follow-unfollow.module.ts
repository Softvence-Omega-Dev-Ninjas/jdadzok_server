import { PrismaService } from "@lib/prisma/prisma.service";
import { Module } from "@nestjs/common";
import { FollowUnfollowRepository } from "./follow-unfollow.repository";
import { FollowUnfollowService } from "./follow-unfollow.service";

@Module({
    imports: [],
    providers: [PrismaService, FollowUnfollowRepository, FollowUnfollowService],
    exports: [FollowUnfollowRepository],
})
export class FollowUnfollowModule {}
