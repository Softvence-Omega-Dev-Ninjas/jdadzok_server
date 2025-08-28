import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/category.dto";
import { CategoryQueryDto } from "./dto/category.query.dto";

@Controller("categories")
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Post()
  async store(
    // @GetUser("user_id") userId: string,
    @Body() body: CreateCategoryDto,
  ) {
    try {
      const category = await this.service.create(body);

      return category;
    } catch (err) {
      return err;
    }
  }
  @Get()
  async index(@Query() query?: CategoryQueryDto) {
    try {
      return query;
    } catch (err) {
      return err;
    }
  }
}
