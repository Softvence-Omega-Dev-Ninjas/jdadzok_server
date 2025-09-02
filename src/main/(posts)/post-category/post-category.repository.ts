import { Injectable } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { CreatePostCategoryDto } from "./dto/category.dto";

@Injectable()
export class PostCategoryRepository {
  constructor(private readonly prisma: PrismaService) { }

  async store(input: Required<CreatePostCategoryDto>) {
    return await this.prisma.postCategory.create({
      data: {
        ...input,
      },
    });
  }
  async findAll() {
    return await this.prisma.postCategory.findMany();
  }
}
