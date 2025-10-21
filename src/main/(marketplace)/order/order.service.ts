import { PrismaService } from "@lib/prisma/prisma.service";
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotAcceptableException,
    NotFoundException,
} from "@nestjs/common";
import { CreateOrderDto } from "./dto/order.dto";
// import { OrderQueryDto } from "./dto/order.query.dto";

@Injectable()
export class OrderService {
    constructor(private readonly prisma: PrismaService) {}

    // added new order.
    async add(userId: string, dto: CreateOrderDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isVerified) {
            throw new BadRequestException("Please Verify your email.");
        }
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });
        if (product?.sellerId === userId) {
            throw new BadRequestException("This Product is unavailable for you.");
        }
        if (product?.price === undefined) {
            throw new Error("Product price is missing, cannot calculate order total.");
        }
        const productPrice = product?.price * dto.quantity;
        if (product.availability < dto.quantity) {
            throw new BadRequestException("Invalid Order.");
        }
        const productQuantity = product.availability - dto.quantity;

        await this.prisma.product.update({
            where: { id: dto.productId },
            data: { availability: productQuantity },
        });

        if (productPrice > dto.totalPrice) {
            throw new BadRequestException("Please Enter Valid Price.");
        }

        const order = await this.prisma.order.create({
            data: {
                buyerId: userId,
                ...dto,
            },
            include: {
                buyer: true,
                product: true,
            },
        });
        return order;
    }

    // get all order...
    async findAll() {
        return this.prisma.order.findMany({});
    }

    // get a single order by id
    async findOne(id: string, userId: string) {
        const orderOwner = await this.prisma.order.findFirst({
            where: { buyerId: userId },
        });
        if (!orderOwner) {
            throw new ForbiddenException("Unauthorized Access.");
        }
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                buyer: true,
                product: true,
            },
        });
        if (!order) {
            throw new NotAcceptableException(`Order is not found`);
        }
        return order;
    }
    // delete order
    async remove(id: string, userId: string) {
        const orderOwner = await this.prisma.order.findFirst({
            where: { buyerId: userId },
        });
        if (!orderOwner) {
            throw new ForbiddenException("Unauthorized Access.");
        }
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
        return this.prisma.order.delete({
            where: { id },
        });
    }
}
