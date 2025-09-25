import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { CreateNgoDto, UpdateNgoDto } from "./dto/ngo.dto";
@Injectable()
export class NgoService {
    constructor(private readonly prisma: PrismaService) {}

    // create new ngo......
    async createNgo(userId: string, dto: CreateNgoDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new ForbiddenException("Unauthorized Access.");
        }
        const ngo = await this.prisma.ngo.findFirst({
            where: {
                ownerId: userId,
                profile: {
                    is: {
                        title: dto.profile?.title,
                    },
                },
            },
        });
        if (ngo) {
            throw new BadRequestException("NGO Already Exist.");
        }

        return await this.prisma.ngo.create({
            data: {
                owner: {
                    connect: { id: userId },
                },
                ngoType: dto.ngoType,
                foundationDate: dto.foundationDate,
                about: {
                    create: {
                        ...dto.about,
                    },
                },
                profile: {
                    create: dto.profile,
                },
            },
            include: {
                profile: true,
                about: true,
            },
        });
    }
    // find ngo data....
    async findAll() {
        const ngo = await this.prisma.ngo.findMany({
            include: {
                about: true,
                profile: true,
            },
        });
        return ngo;
    }

    // delete ngo....
    async deleteNgo(userId: string, ngoId: string) {
        const isExistCommunity = await this.prisma.ngo.findFirst({
            where: {
                id: ngoId,
                ownerId: userId,
            },
        });
        if (!isExistCommunity) {
            throw new NotFoundException("Ngo is not found.");
        }

        return this.prisma.ngo.delete({ where: { id: ngoId } });
    }
    // update ngo...
    async updateNgo(userId: string, ngoId: string, dto: UpdateNgoDto) {
        const isExistNgo = await this.prisma.ngo.findUnique({
            where: { id: ngoId },
        });
        if (!isExistNgo) {
            throw new NotFoundException("Ngo is Not Found.");
        }
        const user = await this.prisma.ngo.findFirst({
            where: { ownerId: userId },
        });
        if (!user) {
            throw new NotFoundException("Unauthorized Access.");
        }

        return this.prisma.ngo.update({
            where: { id: ngoId },
            data: {
                ngoType: dto.ngoType,
                about: {
                    update: {
                        ...dto.about,
                    },
                },
                profile: {
                    update: {
                        ...dto.profile,
                    },
                },
            },
            include: { profile: true, about: true },
        });
    }

    // find one ngo
    async findOne(ngoId: string) {
        const ngo = await this.prisma.ngo.findUnique({
            where: { id: ngoId },
            include: {
                profile: true,
                about: true,
            },
        });
        if (!ngo) {
            throw new NotFoundException("Ngo Not Found");
        }
        return ngo;
    }

    // following ngo.
    async followNgo(userId: string, ngoId: string) {
        await this.prisma.ngo.update({
            where: { id: ngoId },
            data: {
                followers: {
                    connect: { id: userId },
                },
            },
        });
        const count = await this.prisma.ngo.count({
            where: {
                id: ngoId,
                followers: {
                    some: {},
                },
            },
        });

        const result = await this.prisma.ngoProfile.update({
            where: { ngoId },
            data: { followersCount: count },
        });
        return result;
    }
    // unfollowing ngo.
    async unfollowNgo(userId: string, ngoId: string) {
        await this.prisma.ngo.update({
            where: { id: ngoId },
            data: {
                followers: {
                    disconnect: { id: userId },
                },
            },
        });

        const count = await this.prisma.ngo.count({
            where: {
                id: ngoId,
                followers: {
                    some: {},
                },
            },
        });

        const result = await this.prisma.ngoProfile.update({
            where: { ngoId },
            data: { followersCount: count },
        });

        return result;
    }

    // like ngo
    async likeNgo(userId: string, ngoId: string) {
        await this.prisma.ngo.update({
            where: { id: ngoId },
            data: { likers: { connect: { id: userId } } },
        });

        const likes = await this.prisma.ngo.count({
            where: { id: ngoId, likers: { some: {} } },
        });

        await this.prisma.ngo.update({
            where: { id: ngoId },
            data: { likes },
        });

        return { success: true, likes };
    }

    // unlike ngo
    async unlikeNgo(userId: string, ngoId: string) {
        await this.prisma.ngo.update({
            where: { id: ngoId },
            data: { likers: { disconnect: { id: userId } } },
        });
        const likes = await this.prisma.ngo.count({
            where: { id: ngoId, likers: { some: {} } },
        });
        await this.prisma.ngo.update({
            where: { id: ngoId },
            data: { likes },
        });
        return { success: true, likes };
    }

    // Get ngo likes and followers counts.
    async getNgoCounts(ngoId: string) {
        const profile = await this.prisma.ngoProfile.findUnique({
            where: { ngoId },
            select: { followersCount: true },
        });

        const ngo = await this.prisma.ngo.findUnique({
            where: { id: ngoId },
            select: { likes: true },
        });

        return {
            followersCount: profile?.followersCount ?? 0,
            likes: ngo?.likes ?? 0,
        };
    }
}
