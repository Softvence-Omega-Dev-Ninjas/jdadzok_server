import { ConflictException, Injectable } from "@nestjs/common";
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
    return await this.prisma.$transaction(async (tx) => {
      const isUser = await tx.user.findFirst({ where: { email: input.email } });
      // if user already has && user is already verified then throw error otherwise processed
      if (isUser && isUser.isVerified) {
        throw new ConflictException("User already exist, please login");
      }

      if (isUser && !isUser.isVerified) {
        // if it's not verified then give chances to verify account again
        // to do that we have to sent the otp again
        return isUser;
      }

      const createUser = omit(input, ["name"]);
      // make sure role is USER, and cap level none when they create their account
      const user = await tx.user.create({
        data: { ...createUser, role: "USER", capLevel: "NONE" },
      });

      // if input has name then create profile
      const profile = await this.profileRepo.create(
        user.id,
        {
          name: input.name ?? input.email.split("@")[0],
        },
        tx,
      );

      const resObj = { ...user, profile };
      return omit(resObj, ["password"]);
    });
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
    return await this.prisma.user.update({
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
