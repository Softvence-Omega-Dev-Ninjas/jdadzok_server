// import { Injectable, NotAcceptableException, NotFoundException } from "@nestjs/common";
// import { PrismaService } from "@project/lib/prisma/prisma.service";
// import { CreateOrderDto } from "./dto/order.dto";
// import { OrderQueryDto } from "./dto/order.query.dto";

// @Injectable()
// export class OrderService {
//     constructor(private readonly prisma: PrismaService) { }

//     // added new order.
//     async add(dto: CreateOrderDto) {
//         try {
//             return await this.prisma.order.create({
//                 data: {
//                     buyerId: dto.buyerId,
//                     productId: dto.productId,
//                     status: dto.status
//                 },
//                 include: {
//                     buyer: true,
//                     product: true
//                 }
//             })

//         } catch (err) {
//             console.log(err)
//         }
//     }
//     // get all order...
//     async findAll(query?: OrderQueryDto) {
//         return this.prisma.order.findMany({
//             where: {
//                 productId: query?.productId,
//                 status: query?.status,
//             }
//         });
//     }

//     // get a single order by id
//     async findOne(id: string) {
//         const order = await this.prisma.order.findUnique({
//             where: { id },
//             include: {
//                 buyer: true,
//                 product: true
//             }
//         })
//         if (!order) {
//             throw new NotAcceptableException(`Order with ID ${id} not found`)
//         }
//         return order;
//     }
//     // delete order
//     async remove(id: string) {
//         const order = await this.prisma.order.findUnique({ where: { id } });
//         if (!order) {
//             throw new NotFoundException(`Order with ID ${id} not found`);
//         }
//         return this.prisma.order.delete({
//             where: { id }
//         });
//     }


// }