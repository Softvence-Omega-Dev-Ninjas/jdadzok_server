import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { CreateNgoDto, UpdateNgoDto } from "./dto/ngo.dto";
import { NgoQueryDto } from "./dto/ngo.query.dto";

@Injectable()
export class NgoService {
  constructor(private readonly prisma: PrismaService) {}

  // create new ngo......
  async createNgo(userId: string, dto: CreateNgoDto) {
    const ngo = await this.prisma.ngo.findFirst({
      where: {
        ownerId: userId,
        sharedProfile: {
          is: {
            title: dto.sharedProfile.title,
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
        sharedProfile: {
          create: {
            title: dto.sharedProfile.title,
            bio: dto.sharedProfile.bio,
            avatarUrl: dto.sharedProfile.avatarUrl,
            coverUrl: dto.sharedProfile.coverUrl,
            location: dto.sharedProfile.location,
            fieldOfWork: dto.sharedProfile.fieldOfWork,
            About: dto.sharedProfile.About,
            details: dto.sharedProfile.details,
          },
        },
      },
      include: {
        sharedProfile: true,
      },
    });
  }
  // find ngo data....
  async findAll(query?: NgoQueryDto) {
    const ngo = await this.prisma.ngo.findMany({
      where: {
        sharedProfile: {
          is: {
            title: query?.title
              ? { contains: query.title, mode: "insensitive" }
              : undefined,
            bio: query?.bio
              ? { contains: query.bio, mode: "insensitive" }
              : undefined,
            location: query?.location
              ? { contains: query.location, mode: "insensitive" }
              : undefined,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        sharedProfile: true,
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

    return this.prisma.ngo.delete({
      where: { id: ngoId },
    });
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
        foundationDate: dto.foundationDate,
        sharedProfile: dto.sharedProfile
          ? {
              create: {
                title: dto.sharedProfile.title,
                bio: dto.sharedProfile.bio,
                avatarUrl: dto.sharedProfile.avatarUrl,
                coverUrl: dto.sharedProfile.coverUrl,
                location: dto.sharedProfile.location,
                fieldOfWork: dto.sharedProfile.fieldOfWork,
                About: dto.sharedProfile.About,
                details: dto.sharedProfile.details,
              },
            }
          : undefined,
      },
      include: {
        sharedProfile: true,
      },
    });
  }

  // find one ngo
  async findOne(ngoId: string) {
    const ngo = await this.prisma.ngo.findUnique({
      where: { id: ngoId },
      include: { sharedProfile: true },
    });
    if (!ngo) {
      throw new NotFoundException("Ngo Not Found");
    }
    return ngo;
  }
}
