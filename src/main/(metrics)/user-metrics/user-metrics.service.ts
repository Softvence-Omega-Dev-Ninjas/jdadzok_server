import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@lib/prisma/prisma.service";
import { MetricsRange, MetricsType, UserMetricsFilterDto } from "./dto/update-user-metrics.dto";

@Injectable()
export class UserMetricsService {
    constructor(private readonly prisma: PrismaService) {}

    async getUserMetrics(userId: string, filter?: UserMetricsFilterDto) {
        const metrics = await this.prisma.userMetrics.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        capLevel: true,
                    },
                },
            },
        });

        if (!metrics) {
            throw new NotFoundException("User metrics not found");
        }

        if (!filter?.type || !filter?.range) {
            return metrics;
        }

        const fromDate = this.getFromDate(filter.range);
        let count = 0;

        switch (filter.type) {
            case MetricsType.POST:
                count = await this.prisma.post.count({
                    where: {
                        authorId: userId,
                        createdAt: { gte: fromDate },
                    },
                });
                break;

            case MetricsType.LIKE:
                count = await this.prisma.like.count({
                    where: {
                        userId,
                        createdAt: { gte: fromDate },
                    },
                });
                break;

            case MetricsType.COMMENT:
                count = await this.prisma.comment.count({
                    where: {
                        id: userId,
                        createdAt: { gte: fromDate },
                    },
                });
                break;

            case MetricsType.SHARE:
                count = await this.prisma.share.count({
                    where: {
                        userId,
                        createdAt: { gte: fromDate },
                    },
                });
                break;

            case MetricsType.FOLLOWER:
                count = await this.prisma.follow.count({
                    where: {
                        followingId: userId,
                        createdAt: { gte: fromDate },
                    },
                });
                break;
        }

        return {
            userId,
            type: filter.type,
            range: filter.range,
            count,
        };
    }

    private getFromDate(range: MetricsRange): Date {
        const now = new Date();

        switch (range) {
            case MetricsRange.DAYS_7:
                return new Date(now.setDate(now.getDate() - 7));

            case MetricsRange.MONTH_1:
                return new Date(now.setMonth(now.getMonth() - 1));

            case MetricsRange.MONTH_6:
                return new Date(now.setMonth(now.getMonth() - 6));

            case MetricsRange.YEAR_1:
                return new Date(now.setFullYear(now.getFullYear() - 1));

            default:
                return now;
        }
    }
}
