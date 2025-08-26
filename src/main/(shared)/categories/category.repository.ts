import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import queryBuilderService from "@project/services/query-builder.service";
import { CreateCategoryDto } from "./dto/category.dto";
import { CategoryQueryDto } from "./dto/category.query.dto";

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
  async findAll(options?: CategoryQueryDto) {
    const safeOptions = {
      page: options?.page ?? 1,
      limit: options?.limit ?? 10,
      ...options,
    };

    const query = queryBuilderService.buildQuery<
      Prisma.PostWhereInput,
      Prisma.PostInclude,
      CategoryQueryDto
    >(safeOptions);
    return await this.prisma.post.findMany({ ...query });
  }
}
