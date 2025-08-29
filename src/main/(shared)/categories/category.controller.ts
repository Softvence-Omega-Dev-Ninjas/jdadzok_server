import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/category.dto";

@ApiBearerAuth()
@Controller("categories")
export class CategoryController {
  constructor(private readonly service: CategoryService) { }

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
  async index() {
    try {
      return await this.service.index();
    } catch (err) {
      return err;
    }
  }
}
