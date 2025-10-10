import { PrismaService } from "@app/lib/prisma/prisma.service";
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { CreateProductDto, updateProductDto } from "./dto/product.dto";
import { ProductQueryDto } from "./dto/product.query.dto";

@Injectable()
export class ProductService {
    constructor(private readonly prisma: PrismaService) {}
    // create product new product
    async create(userId: string, dto: CreateProductDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException("Unauthorized Access");
        }
        const product = await this.prisma.product.findFirst({
            where: { title: dto.title },
        });
        if (product) {
            throw new BadRequestException("This Product Already Exist.");
        }
        const category = await this.prisma.productCategory.findUnique({
            where: { id: dto.categoryId },
        });

        if (!category) {
            throw new BadRequestException("Invalid categoryId, category does not exist.");
        }
        const { categoryId, ...rest } = dto;
        return await this.prisma.product.create({
            data: {
                ...rest,
                sellerId: userId,
                categoryId,
            },
            include: {
                seller: true,
            },
        });
    }
    // get all product...
    async findAll(userId: string, query?: ProductQueryDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException("Unauthorized Access");
        }
        return this.prisma.product.findMany({
            where: {
                title: query?.search ? { contains: query.search, mode: "insensitive" } : undefined,
                price: {
                    gte: query?.minPrice,
                    lte: query?.maxPrice,
                },
                isVisible: true,
            },
            orderBy: { createdAt: "desc" },
            include: {
                seller: true,
            },
        });
    }
    // get a single product by id.
    async findOne(userId: string, id: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException("Unauthorized Access");
        }
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
    async update(userId: string, id: string, dto: updateProductDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException("Unauthorized Access");
        }
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        if (product.sellerId !== userId) {
            throw new ForbiddenException("Unauthorized Access.");
        }
        return this.prisma.product.update({
            where: { id },
            data: {
                sellerId: userId,
                ...dto,
            },
        });
    }

    // delete product...
    async remove(id: string, userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException("Unauthorized Access");
        }
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product is not found`);
        }
        const seller = await this.prisma.product.findFirst({
            where: { sellerId: userId },
        });
        if (!seller) {
            throw new BadRequestException("Invalid Seller.");
        }
        return this.prisma.product.delete({
            where: { id },
        });
    }
}
