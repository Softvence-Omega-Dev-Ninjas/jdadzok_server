import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { handleRequest } from '@project/common/utils/handle.request.util';

@Controller('product-category')
export class ProductCategoryController {
    constructor(private readonly service: ProductCategoryService) { }

    @Post('')
    async create(@Body() dto: CreateProductCategoryDto) {
        return handleRequest(
            () => this.service.create(dto),
            "Added Product Category Successfully",
        );
    }
    @Get('')
    async findAll(){
         return handleRequest(
            () => this.service.findAll(),
            "Get All Product Category Successfully",
        );
    }

    // @Delete(':id')
    // async remove(@Param('id') id:string){
    //      return handleRequest(
    //         () => this.service.remove(id),
    //         "Delete Product Category Successfully",
    //     );
    // }
}
