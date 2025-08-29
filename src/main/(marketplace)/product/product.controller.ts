import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { handleRequest } from "@project/common/utils/handle.request.util";
import { CreateProductDto, OfferDto } from "./dto/product.dto";
import { ProductQueryDto } from "./dto/product.query.dto";
import { ProductService } from "./product.service";

@Controller("products")
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Post("/")
  @ApiOperation({ summary: "Create new product" })
  async create(@Body() dto: CreateProductDto) {
    return handleRequest(
      () => this.service.create(dto),
      "Product created successfully",
    );
  }
  @Get("/")
  @ApiOperation({ summary: "Get all products with filters" })
  @ApiResponse({ status: 200, description: "List of products" })
  async findAll(@Query() query?: ProductQueryDto) {
    return handleRequest(
      () => this.service.findAll(query),
      "Products fetched successfully",
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single product by ID" })
  @ApiResponse({ status: 200, description: "Product details" })
  async findOne(@Param("id") id: string) {
    return handleRequest(
      () => this.service.findOne(id),
      "Get Single Product Successfully",
    );
  }

  // @Patch(':id')
  // @ApiOperation({ summary: 'Update a product by ID' })
  // @ApiResponse({ status: 200, description: 'Product updated successfully' })
  // async update(@Param('id') id: string, @Body() dto: updateProductDto) {
  //     return handleRequest(() => this.service.update(id, dto), 'Product updated successfully');
  // }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a product by Id" })
  @ApiResponse({ status: 200, description: "Product deleted successfully" })
  async remove(@Param("id") id: string) {
    return handleRequest(
      () => this.service.remove(id),
      "Product deleted successfully",
    );
  }
  //  offer......
  @Patch("/offer/:id")
  @ApiOperation({ summary: "Give offer a single product" })
  @ApiResponse({ status: 200, description: "Added Product Offer Successfully" })
  async offer(@Param("id") id: string, @Body() dto: OfferDto) {
    return handleRequest(
      () => this.service.offer(id, dto),
      "Product updated successfully",
    );
  }
}
