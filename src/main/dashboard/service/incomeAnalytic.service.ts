import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class IncomeAnalyticService {
    constructor(private readonly prisma: PrismaService) {}

    async getOverview() {
        let verifiedNgoAndCommunity = 0;
        const totaVerifiedNgo = await this.prisma.ngo.count({ where: { isVerified: true } });
        const totalVerifiedCommunity = await this.prisma.community.count({
            where: { isVerified: true },
        });
        verifiedNgoAndCommunity = totaVerifiedNgo + totalVerifiedCommunity;
        return {
            verifiedNgoAndCommunity,
        };
    }
}
