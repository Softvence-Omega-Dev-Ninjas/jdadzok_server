import { Injectable } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { omit } from "@project/utils";
import { CreateUserDto, UpdateUserDto } from "./dto/users.dto";

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async store(input: CreateUserDto) {
    // make sure role is admin, and cap level none when they create their account
    const user = await this.prisma.user.create({
      data: { ...input, role: "USER", capLevel: "NONE" },
    });
    return omit(user, ["password"]);
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
