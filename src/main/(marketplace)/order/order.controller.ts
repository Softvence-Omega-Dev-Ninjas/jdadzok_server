// import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
// import { ApiOperation, ApiResponse } from "@nestjs/swagger";
// import { handleRequest } from "@project/common/utils/handle.request.util";
// import { CreateOrderDto } from "./dto/order.dto";
// import { OrderQueryDto } from "./dto/order.query.dto";
// import { OrderService } from "./order.service";

// @Controller('orders')

// export class OrderController {
//     constructor(private readonly service: OrderService) { }

//     @Post('/')
//     @ApiOperation({ summary: 'Added new order' })
//     async add(@Body() dto: CreateOrderDto) {
//         return handleRequest(() => this.service.add(dto), "Added new order successfully");
//     }

//     @Get('/')
//     @ApiOperation({ summary: 'Get all product with filters' })
//     @ApiResponse({ status: 200, description: 'List of the orders' })
//     async findAll(@Query() query?: OrderQueryDto) {
//         return handleRequest(() => this.service.findAll(query), 'Get All Order Successfully');
//     }

//     @Get(':id')
//     @ApiOperation({ summary: 'Get a single order by ID' })
//     @ApiResponse({ status: 200, description: 'Order details' })
//     async findOne(@Param('id') id: string) {
//         return handleRequest(() => this.service.findOne(id), 'Get Single Order Successfully');
//     }

//     // @Patch(':id')
//     // @ApiOperation({ summary: 'Update a product by ID' })
//     // @ApiResponse({ status: 200, description: 'Product updated successfully' })
//     // async update(@Param('id') id: string, @Body() dto: updateProductDto) {
//     //     return handleRequest(() => this.service.update(id, dto), 'Product updated successfully');
//     // }

//     @Delete(':id')
//     @ApiOperation({ summary: 'Delete a order by Id' })
//     @ApiResponse({ status: 200, description: 'Order deleted successfully' })
//     async remove(@Param('id') id: string) {
//         return handleRequest(() => this.service.remove(id), "Order deleted successfully");
//     }



// }