import { Injectable } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { CreateCategoryDto } from "./dto/category.dto";

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async store(input: Required<CreateCategoryDto>) {
    return await this.prisma.category.create({
      data: {
        ...input,
      },
    });
  }
  async findAll() {
    return await this.prisma.category.findMany();
  }
}
