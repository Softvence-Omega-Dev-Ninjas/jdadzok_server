import { Injectable } from "@nestjs/common";
import { slugify } from "@project/utils";
import { CategoryRepository } from "./category.repository";
import { CreateCategoryDto } from "./dto/category.dto";
import { CategoryQueryDto } from "./dto/category.query.dto";

@Injectable()
export class CategoryService {
    constructor(private readonly repository: CategoryRepository) { }

    async create(input: CreateCategoryDto) {
        // generate slug from the name
        const slug = slugify(input.name)
        // TODO: check category already exist or not 

        return await this.repository.store({ ...input, slug });
    }
    async index(options?: CategoryQueryDto) {
        return await this.repository.findAll(options);
    }
}