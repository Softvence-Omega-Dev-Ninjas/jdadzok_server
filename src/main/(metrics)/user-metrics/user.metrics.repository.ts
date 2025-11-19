import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { UpdateUserMetricsDto } from "./dto/update-user-metrics.dto";

@Injectable()
export class UserMetricsRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByUserId(userId: string) {
        return await this.prisma.userMetrics.findUnique({ where: { userId } });
    }

    async findUser(userId: string) {
        return await this.prisma.userMetrics.findUnique({
            where: { userId },
        });
    }

    async createDefault(userId: string) {
        return await this.prisma.userMetrics.create({
            data: { userId },
        });
    }

    async updateMetrics(data: UpdateUserMetricsDto) {
        const { userId, ...metrics } = data;
        return await this.prisma.userMetrics.update({
            where: { userId },
            data: { ...metrics, lastUpdated: new Date() },
        });
    }

    async updateActivityScore(userId: string, score: number) {
        return await this.prisma.userMetrics.update({
            where: { userId },
            data: { activityScore: score, lastUpdated: new Date() },
        });
    }
    async updateUserActivityScore(userId: string, points = 10) {
        // 10 points for creating post
        await this.prisma.userMetrics.update({
            where: { userId },
            data: {
                activityScore: { increment: points },
            },
        });
    }
}
