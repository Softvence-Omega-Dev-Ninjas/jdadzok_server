import {
  BadRequestException,
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
      throw new BadRequestException("Community Already Exist.");
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
}
