import { Injectable } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { omit } from "@project/utils";
import { UserProfileRepository } from "../user-profile/user.profile.repository";
import { CreateUserDto, UpdateUserDto } from "./dto/users.dto";

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileRepo: UserProfileRepository,
  ) {}

  async store(input: CreateUserDto) {
    // make sure role is USER, and cap level none when they create their account
    const createUser = omit(input, ["name"]);
    const user = await this.prisma.user.create({
      data: { ...createUser, role: "USER", capLevel: "NONE" },
    });

    // if input has name then create profile
    const profile = await this.profileRepo.create(user.id, {
      name: input.name ?? "",
    });

    const resObj = { ...user, profile };
    return omit(resObj, ["password"]);
  }
  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }
  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        about: true,
        adRevenueShares: true,
        bans: true,
        chatParticipant: true,
        comments: true,
        communityMemberships: true,
        corporateContacts: true,
        createdChats: true,
        creatorSubscriptions: true,
        followedNgos: true,
        followers: true,
        following: true,
        givenEndorsements: true,
        issuedBans: true,
        likedCommunities: true,
        likedNgos: true,
        likes: true,
        metrics: true,
        notifications: true,
        posts: true,
        products: true,
        wishlist: true,
        userChoices: true,
      },
    });
  }

  async update(id: string, data: Partial<UpdateUserDto>) {
    await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }
  async delete(userId: string) {
    return await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}
