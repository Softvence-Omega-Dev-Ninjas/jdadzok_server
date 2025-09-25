import { Injectable, NotFoundException } from "@nestjs/common";
import { UserMetrics } from "@prisma/client";
import { CreateUserMetricsDto, UpdateUserMetricsDto } from "./dto/user-metrics.dto";
import { UserMetricsRepository } from "./user.metrics.repository";

@Injectable()
export class UserMetricsService {
    constructor(private readonly userMetricsRepository: UserMetricsRepository) {}

    async create(createUserMetricsDto: CreateUserMetricsDto): Promise<UserMetrics> {
        // logic to create user metrics
        return await this.userMetricsRepository.create(createUserMetricsDto);
    }

    async findOne(userId: string): Promise<UserMetrics> {
        const userMetrics = await this.userMetricsRepository.findOne(userId);
        if (!userMetrics) {
            throw new NotFoundException(`User metrics for userId ${userId} not found.`);
        }
        return userMetrics;
    }

    async findAll(): Promise<UserMetrics[]> {
        return this.userMetricsRepository.findAll();
    }

    async update(userId: string, updateUserMetricsDto: UpdateUserMetricsDto): Promise<UserMetrics> {
        const userMetrics = await this.userMetricsRepository.update(userId, updateUserMetricsDto);
        if (!userMetrics) {
            throw new NotFoundException(`User metrics for userId ${userId} not found.`);
        }
        return userMetrics;
    }
}
