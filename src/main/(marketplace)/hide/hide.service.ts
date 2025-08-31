import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";

@Injectable()
export class HideService {
    constructor(private readonly prisma: PrismaService) { }

    async toggleVisibility(productId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId }
        });
        if (!product) {
            throw new NotFoundException("Product not found");
        }
        return this.prisma.product.update({
            where: { id: productId },
            data: { isVisible: !product.isVisible },
        })
    }

}