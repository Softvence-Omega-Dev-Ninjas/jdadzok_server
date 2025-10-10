import { PrismaService } from "@app/lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FeedRepository {
    constructor(private readonly prisma: PrismaService) {}
}
