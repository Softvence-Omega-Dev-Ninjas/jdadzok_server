import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { CreateProductDto, updateProductDto } from "./dto/product.dto";
import { ProductQueryDto } from "./dto/product.query.dto";


@Injectable()
export class ProductService {
    constructor(private readonly prisma: PrismaService) { }
    // create product new product
    async create(dto: CreateProductDto) {
        try {
            return await this.prisma.product.create({
                data: {
                    sellerId: dto.sellerId,
                    description: dto.description,
                    price: dto.price,
                    title: dto.title,
                },
                include: {
                    seller: true
                }
            });
        } catch (err) {
            console.log(err)
        }
    }
    // get all product...
    async findAll(query?: ProductQueryDto) {
        return this.prisma.product.findMany({
            where: {
                title: query?.search ? { contains: query.search, mode: 'insensitive' } : undefined,
                price: {
                    gte: query?.minPrice,
                    lte: query?.maxPrice,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    // get a single product by id.
    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id }
        })
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`)
        }
        return product;

    }
    // update product with id
    async update(id: string, dto: updateProductDto) {
        console.log(id)
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return this.prisma.product.update({
            where: { id },
            data: {
                ...dto
            },
        });
    }

    async remove(id: string) {
        const product = await this.prisma.product.findUnique({ where: { id } });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return this.prisma.product.delete({
            where: { id },
        });
    }



}