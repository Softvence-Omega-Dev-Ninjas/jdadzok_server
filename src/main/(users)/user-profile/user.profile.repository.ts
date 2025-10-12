import { HelperTx } from "@app/@types";
import { PrismaService } from "@app/lib/prisma/prisma.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserProfileDto } from "./dto/user.profile.dto";

@Injectable()
export class UserProfileRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: string, input: CreateUserProfileDto, tx: HelperTx) {
        const user = await tx.user.findFirst({
            where: { id: userId },
            include: { profile: true },
        });
        if (!user) throw new NotFoundException("User not found!");

        if (user.profile) {
            return await tx.profile.update({
                where: {
                    userId: user.id!,
                    username: user.profile.username,
                },
                data: {
                    ...input,
                    followersCount: 0,
                    followingCount: 0,
                },
            });
        }
        return await tx.profile.create({
            data: {
                ...input,
                username: input.username ?? user.email.split("@")[0],
                name: input.name!,
                userId: user.id,
            },
        });
    }
    async update(userId: string, input: CreateUserProfileDto) {
        return await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findFirst({
                where: { id: userId },
                include: { profile: true },
            });
            if (!user) throw new NotFoundException("User not found!");
            if (!user.profile) throw new NotFoundException("User profile not found!");

            const { profile } = user;
            return await tx.profile.update({
                where: { id: profile.id, userId: userId },
                data: {
                    ...input,
                    username: input.username ?? user.email.split("@")[0],
                    name: input.name ?? profile.name,
                },
            });
        });
    }
    async delete(userId: string) {
        return await this.prisma.$transaction(async (tx) => {
            const profile = await tx.profile.findFirst({ where: { userId } });
            if (!profile) throw new NotFoundException("User profile not found!");

            return await this.prisma.profile.delete({
                where: {
                    id: profile.id,
                    userId,
                },
            });
        });
    }

    async find(userId: string) {
        return await this.prisma.profile.findFirst({
            where: {
                userId,
            },
            include: {
                user: true,
            },
        });
    }
    async updateUserProfile(userId: string, data: CreateUserProfileDto) {
        // Check if username is taken by another user
        if (data.username) {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    AND: [{ profile: { username: data.username } }, { NOT: { id: userId } }],
                },
            });

            if (existingUser) {
                throw new BadRequestException("Username already taken");
            }
        }

        return await this.prisma.user.update({
            where: { id: userId },
            data: {
                profile: {
                    update: {
                        ...(data.name && { name: data.name }),
                        ...(data.username && { username: data.username }),
                        ...(data.bio && { bio: data.bio }),
                        ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
                        ...(data.coverUrl && { coverUrl: data.coverUrl }),
                        ...(data.location && { location: data.location }),
                    },
                },
            },
            include: { profile: true },
        });
    }
}
