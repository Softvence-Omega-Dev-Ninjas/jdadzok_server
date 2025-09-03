import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { CreateUserProfileDto } from "./dto/user.profile.dto";

@Injectable()
export class UserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, input: CreateUserProfileDto) {
    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({ where: { id: userId } });
      if (!user) throw new NotFoundException("User not found!");

      return await tx.profile.create({
        data: {
          ...input,
          username: input.username ?? user.email.split("@")[0],
          name: input.name!,
          userId: user.id,
        },
      });
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
}
