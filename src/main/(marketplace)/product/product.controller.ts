import { GetUser } from "@common/jwt/jwt.decorator";
import { handleRequest } from "@common/utils/handle.request.util";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateProductDto, updateProductDto } from "./dto/product.dto";
import { ProductQueryDto } from "./dto/product.query.dto";
import { ProductService } from "./product.service";
import { UpdateProductStatusDto } from "./dto/updateStatusDto";
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("products")
export class ProductController {
    constructor(private readonly service: ProductService) {}

    @Post("/")
    @ApiOperation({ summary: "Create new product" })
    async create(@Body() dto: CreateProductDto, @GetUser("userId") userId: string) {
        return handleRequest(
            () => this.service.create(userId, dto),
            "Product created successfully",
        );
    }

    @Get("/")
    @ApiOperation({ summary: "Get all products with filters" })
    @ApiResponse({ status: 200, description: "List of products" })
    async findAll(@GetUser("userId") userId: string, @Query() query?: ProductQueryDto) {
        return handleRequest(
            () => this.service.findAll(userId, query),
            "Products fetched successfully",
        );
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a single product by ID" })
    @ApiResponse({ status: 200, description: "Product details" })
    async findOne(@GetUser("userId") userId: string, @Param("id") id: string) {
        return handleRequest(
            () => this.service.findOne(userId, id),
            "Get Single Product Successfully",
        );
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a product by ID" })
    @ApiResponse({ status: 200, description: "Product updated successfully" })
    async update(
        @GetUser("userId") userId: string,
        @Param("id") id: string,
        @Body() dto: updateProductDto,
    ) {
        return handleRequest(
            () => this.service.update(userId, id, dto),
            "Product updated successfully",
        );
    }

    @Delete(":id")
    @ApiOperation({ summary: "Delete a product by Id" })
    @ApiResponse({ status: 200, description: "Product deleted successfully" })
    async remove(@Param("id") id: string, @GetUser("userId") userId: string) {
        return handleRequest(() => this.service.remove(id, userId), "Product deleted successfully");
    }

    // update product status
    @Patch("status/:id")
    @ApiOperation({ summary: "Update product status by ID" })
    @ApiConsumes("multipart/formdata")
    async updateStatus(
        @Param("id") id: string,
        @Body() dto: UpdateProductStatusDto,
        @GetUser("userId") userId: string,
    ) {
        try {
            const res = await this.service.updateProductStatus(id, dto, userId);
            return {
                message: "Product status updated successfully",
                data: res,
            };
        } catch (err) {
            throw new HttpException(err.message, err.status);
        }
    }

    // Todo--------
    // # Marketplaces
    // ### update (marketplace to message page)
    // ### added product report (if insure to the frontend developer)
    // ### copyLink implement frontend devoloper
}
