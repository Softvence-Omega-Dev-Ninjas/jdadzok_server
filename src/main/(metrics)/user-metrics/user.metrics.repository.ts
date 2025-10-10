import { PrismaService } from '@lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdateUserMetricsDto } from './dto/update-user-metrics.dto';

@Injectable()
export class UserMetricsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByUserId(userId: string) {
        return this.prisma.userMetrics.findUnique({ where: { userId } });
    }

    async createDefault(userId: string) {
        return this.prisma.userMetrics.create({
            data: { userId },
        });
    }

    async updateMetrics(data: UpdateUserMetricsDto) {
        const { userId, ...metrics } = data;
        return this.prisma.userMetrics.update({
            where: { userId },
            data: { ...metrics, lastUpdated: new Date() },
        });
    }

    async updateActivityScore(userId: string, score: number) {
        return this.prisma.userMetrics.update({
            where: { userId },
            data: { activityScore: score, lastUpdated: new Date() },
        });
    }
}
