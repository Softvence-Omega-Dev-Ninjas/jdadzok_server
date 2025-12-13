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
}
