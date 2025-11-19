import { Injectable, NotFoundException } from "@nestjs/common";
import { UserMetricsRepository } from "./user.metrics.repository";

@Injectable()
export class UserMetricsService {
    constructor(private readonly repo: UserMetricsRepository) {}

    async getUserMetrics(userId: string) {
        const metrics = await this.repo.findByUserId(userId);
        if (!metrics) throw new NotFoundException("User metrics not found");
        return metrics;
    }

    async getUserMetricsById(userId: string) {
        const metrics = await this.repo.findUser(userId);
        if (!metrics) throw new NotFoundException("User metrics not found");
        return metrics;
    }

    // async updateMetrics(dto: UpdateUserMetricsDto) {
    //     const metrics = await this.repo.findByUserId(dto.userId);
    //     if (!metrics) {
    //         await this.repo.createDefault(dto.userId);
    //     }
    //     return this.repo.updateMetrics(dto);
    // }

    // async calculateActivityScore({ userId }: CalculateActivityScoreDto) {
    //     const metrics = await this.repo.findByUserId(userId);
    //     if (!metrics) throw new NotFoundException("User metrics not found");

    //     // Activity scoring algorithm (from CAP System)
    //     const score =
    //         metrics.totalPosts * 5 +
    //         metrics.totalComments * 2 +
    //         metrics.totalLikes * 1 +
    //         metrics.totalShares * 3 +
    //         metrics.totalFollowers * 0.5 +
    //         metrics.volunteerHours * 10;

    //     return this.repo.updateActivityScore(userId, score);
    // }
}
