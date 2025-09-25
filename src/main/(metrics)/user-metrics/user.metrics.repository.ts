import { Injectable } from "@nestjs/common";
import { UserMetrics } from "@prisma/client";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { CreateUserMetricsDto, UpdateUserMetricsDto } from "./dto/user-metrics.dto";

@Injectable()
export class UserMetricsRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(createUserMetricsDto: CreateUserMetricsDto): Promise<UserMetrics> {
        return await this.prisma.userMetrics.create({
            data: createUserMetricsDto,
        });
    }

    async findOne(userId: string): Promise<UserMetrics | null> {
        return await this.prisma.userMetrics.findUnique({
            where: { userId },
        });
    }

    async findAll(): Promise<UserMetrics[]> {
        return await this.prisma.userMetrics.findMany();
    }

    async update(userId: string, updateUserMetricsDto: UpdateUserMetricsDto): Promise<UserMetrics> {
        return await this.prisma.userMetrics.update({
            where: { userId },
            data: updateUserMetricsDto,
        });
    }
}
