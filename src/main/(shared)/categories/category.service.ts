import { Injectable } from "@nestjs/common";
import { slugify } from "@project/utils";
import { CategoryRepository } from "./category.repository";
import { CreateCategoryDto } from "./dto/category.dto";

@Injectable()
export class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}

  async create(input: CreateCategoryDto) {
    // generate slug from the name
    const slug = slugify(input.name);
    // TODO: check category already exist or not

    return await this.repository.store({ ...input, slug });
  }
  async index() {
    return await this.repository.findAll();
  }
}
