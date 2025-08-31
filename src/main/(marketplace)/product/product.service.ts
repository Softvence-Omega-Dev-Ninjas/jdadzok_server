import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { CreateProductDto, OfferDto } from "./dto/product.dto";
import { ProductQueryDto } from "./dto/product.query.dto";

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) { }
  // create product new product
  async create(userId: string, dto: CreateProductDto) {
    try {
      return await this.prisma.product.create({
        data: {
          sellerId: userId,
          description: dto.description,
          price: dto.price,
          title: dto.title,
          categoryId: dto.categoryId,
          location: dto.location,
          availability: dto.availability,

        },
        include: {
          seller: true,
        },
      });
    } catch (err) {
      return err;
    }
  }
  // get all product...
  async findAll(query?: ProductQueryDto) {
    return this.prisma.product.findMany({
      where: {
        title: query?.search
          ? { contains: query.search, mode: "insensitive" }
          : undefined,
        price: {
          gte: query?.minPrice,
          lte: query?.maxPrice,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        seller: true,
      },
    });
  }
  // get a single product by id.
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        orders: true,
        seller: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  // update product with id
  // async update(id: string, dto: updateProductDto) {
  //     const product = await this.prisma.product.findUnique({ where: { id } });
  //     if (!product) {
  //         throw new NotFoundException(`Product with ID ${id} not found`);
  //     }
  //     return this.prisma.product.update({
  //         where: { id },
  //         data: {
  //             ...dto
  //         },
  //     });
  // }

  // delete product...
  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.prisma.product.delete({
      where: { id },
    });
  }

  // offer
  async offer(id: string, dto: OfferDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    if (product.price <= 0) return 0;

    const discountAmount = (product.price * dto.discount) / 100;
    const finalPrice = product.price - discountAmount;
    return finalPrice.toFixed(2);
  }





}
