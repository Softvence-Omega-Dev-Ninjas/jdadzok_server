import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { CreateProductCategoryDto } from "./dto/create-product-category.dto";
import { slugify } from "@project/utils";

@Injectable()
export class ProductCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductCategoryDto) {
    const uniSlug = slugify(dto.name);
    const existCategory = await this.prisma.productCategory.findFirst({
      where: { slug: uniSlug },
    });
    if (existCategory) {
      throw new BadRequestException("This Product Category Already Exist.");
    }
    const category = await this.prisma.productCategory.create({
      data: {
        name: dto.name,
        slug: uniSlug,
        description: dto.description,
      },
    });
    return category;
  }

  async findAll() {
    return await this.prisma.productCategory.findMany({});
  }

  // async remove(id:string){
  //     return await this.prisma.productCategory.delete({where:{id}})
  // }
}
