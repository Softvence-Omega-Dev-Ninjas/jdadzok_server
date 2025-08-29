import { Injectable } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { CreateCommunityDto } from "./dto/communities.dto";

@Injectable()
export class CommunitiesService {
    constructor(private readonly prisma: PrismaService) { }

    async createCommunity(userId: string, dto: CreateCommunityDto) {
        return "Create new community"
    }

}