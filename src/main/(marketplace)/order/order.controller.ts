import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { handleRequest } from "@project/common/utils/handle.request.util";
import { CreateOrderDto } from "./dto/order.dto";
import { OrderService } from "./order.service";
import { JwtAuthGuard } from "@project/main/(started)/auth/guards/jwt-auth";
import { GetUser } from "@project/common/jwt/jwt.decorator";


@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')

export class OrderController {
    constructor(private readonly service: OrderService) { }

    @Post('/')
    @ApiOperation({ summary: 'Added new order' })
    async add(@Body() dto: CreateOrderDto, @GetUser("userId") userId:string) {
        return handleRequest(() => this.service.add(userId, dto),"Added new order successfully");
    }

    @Get('/')
    @ApiOperation({ summary: 'Get all product with filters' })
    @ApiResponse({ status: 200, description: 'List of the orders' })
    async findAll() {
        return handleRequest(() => this.service.findAll(), 'Get All Order Successfully');
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single order by ID' })
    @ApiResponse({ status: 200, description: 'Order details' })
    async findOne(@Param('id') id: string, @GetUser("userId") userId:string) {
        return handleRequest(() => this.service.findOne(id, userId), 'Get Single Order Successfully');
    }

    // @Patch(':id')
    // @ApiOperation({ summary: 'Update a product by ID' })
    // @ApiResponse({ status: 200, description: 'Product updated successfully' })
    // async update(@Param('id') id: string, @Body() dto: updateProductDto) {
    //     return handleRequest(() => this.service.update(id, dto), 'Product updated successfully');
    // }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a order by Id' })
    @ApiResponse({ status: 200, description: 'Order deleted successfully' })
    async remove(@Param('id') id: string, @GetUser("userId") userId:string) {
        return handleRequest(() => this.service.remove(id, userId), "Order deleted successfully");
    }

}
