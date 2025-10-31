import { Injectable } from "@nestjs/common";
import { slugify } from "@utils/index";
import { CreatePostCategoryDto } from "./dto/category.dto";
import { PostCategoryRepository } from "./post-category.repository";

@Injectable()
export class PostCategoryService {
    constructor(private readonly repository: PostCategoryRepository) {}

    async create(input: CreatePostCategoryDto) {
        // generate slug from the name
        const slug = slugify(input.name);
<<<<<<< HEAD
=======

>>>>>>> c8846f9f9b9c0e4e07143f52c64a6e1f550f9932
        return await this.repository.store({ ...input, slug });
    }
    async index() {
        return await this.repository.findAll();
    }
}
