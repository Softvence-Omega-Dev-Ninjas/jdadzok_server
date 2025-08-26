import { Injectable } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { CreateChoiceDto } from "./dto/choices.create.dto";

@Injectable()
export class ChoicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(data: CreateChoiceDto[]) {
    return await this.prisma.choice.createManyAndReturn({
      data: data as any,
      skipDuplicates: true,
    });
  }
}
