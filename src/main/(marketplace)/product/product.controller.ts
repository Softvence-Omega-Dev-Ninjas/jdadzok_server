import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { successResponse } from "@project/common/utils/response.util";
import { CreateProductDto, updateProductDto } from "./dto/product.dto";
import { ProductQueryDto } from "./dto/product.query.dto";
import { ProductService } from "./product.service";

@Controller("products")
export class ProductController {
    constructor(private readonly service: ProductService) { }

    @Post('/')
    @ApiOperation({ summary: 'Create new product' })
    async create(@Body() dto: CreateProductDto) {
        try {
            console.log(dto)
            const product = await this.service.create(dto)
            return successResponse(product, "Product created successfully")
        } catch (err) {
            console.log(err)
        }
    }
    @Get('/')
    @ApiOperation({ summary: 'Get all products with filters' })
    @ApiResponse({ status: 200, description: 'List of products' })
    async findAll(@Query() query?: ProductQueryDto) {
        try {
            const products = await this.service.findAll(query);
            return successResponse(products, 'Products fetched successfully');
        } catch (err) {
            throw err;
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single product by ID' })
    @ApiResponse({ status: 200, description: 'Product details' })
    async findOne(@Param('id') id: string) {
        const product = await this.service.findOne(id)
        return successResponse(product, 'Get a single product successfully');
    }


    @Patch(':id')
    @ApiOperation({ summary: 'Update a product by ID' })
    @ApiResponse({ status: 200, description: 'Product updated successfully' })
    async update(@Param('id') id: string, @Body() dto: updateProductDto) {
        console.log(id)
        const product = await this.service.update(id, dto);
        console.log(id, product)
        return successResponse(product, 'Product updated successfully');
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a product by Id' })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    async remove(@Param('id') id: string) {
        const deleted = await this.service.remove(id)
        return successResponse(deleted, "Product deleted successfully")
    }

}