import { Injectable } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { omit } from "@project/utils";
import { CreateUserDto } from "./dto/users.dto";

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) { }

  async store(input: CreateUserDto) {
    // make sure role is admin, and cap level none when they create their account
    const user = await this.prisma.user.create({
      data: { ...input, role: "USER", capLevel: "NONE" },
    });
    return omit(user, ["passwordHash"])
  }
  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }
  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Partial<CreateUserDto>) {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getFollowingIds(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        following: {
          select: {
            id: true
          }
        }
      }
    })
    return user?.following.map((u) => u.id) ?? []
  }
}
