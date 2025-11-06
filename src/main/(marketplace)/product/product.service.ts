import { PrismaService } from "@lib/prisma/prisma.service";
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { CreateProductDto, updateProductDto } from "./dto/product.dto";
import { ProductQueryDto } from "./dto/product.query.dto";
import { UpdateProductStatusDto } from "./dto/updateStatusDto";
import { HelperService } from "./helper/helper";

@Injectable()
export class ProductService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly helper: HelperService,
    ) {}
    // create product new product
    async create(userId: string, dto: CreateProductDto) {
        // 1️ Verify seller
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException("Unauthorized Access");

        //   // 2️ Prevent duplicate product
        const existing = await this.prisma.product.findFirst({
            where: { title: dto.title },
        });
        if (existing) throw new BadRequestException("This Product Already Exists.");

        // 3️ Validate category
        const category = await this.prisma.productCategory.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category)
            throw new BadRequestException("Invalid categoryId, category does not exist.");

        // const activityTable = await this.prisma.activityScore.findFirst();
        // if (!activityTable) {
        //     throw new BadRequestException("Activity data not found");
        // }
        // 4️ Create product
        const { categoryId, ...rest } = dto;
        // const totalSpentValue = (dto.price / 100) * activityTable.productSpentPercentage || 4;
        // const promotionFee =
        //     (totalSpentValue / 100) * activityTable?.productPromotionPercentage || 2;
        const newProduct = await this.prisma.product.create({
            data: {
                ...rest,
                sellerId: userId,
                categoryId,
                // promotionFee: promotionFee,
                // spent: totalSpentValue,
            },
            include: { seller: true },
        });

        // await this.helper.attachProductToEligiblePosts(newProduct.id);

        return newProduct;
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

    // update product status
    async updateProductStatus(productId: string, dto: UpdateProductStatusDto, userId: string) {
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        if (product.sellerId !== userId) {
            throw new ForbiddenException("You are not authorized to update this product status");
        }

        //  update status + remove ad if necessary
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedProduct = await tx.product.update({
                where: { id: productId },
                data: { status: dto.status },
            });

            // If product is sold out or discontinued → remove ad
            if (dto.status === "SOLDOUT" || dto.status === "DISCONTINUED") {
                await tx.dedicatedAd.updateMany({
                    where: { adId: productId },
                    data: {
                        active: false,
                    },
                });
            }

            return updatedProduct;
        });

        return result;
    }

    // TODO: When revenue calculate for each user.must be dedicated table will be deleted of calculate all reveney
}
