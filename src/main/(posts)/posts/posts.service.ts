import { BadRequestException, Injectable } from "@nestjs/common";
import { CreatePostDto } from "./dto/create.post.dto";
import { PostQueryDto } from "./dto/posts.query.dto";
import { PostRepository } from "./posts.repository";

@Injectable()
export class PostService {
  constructor(private readonly repository: PostRepository) {}

  async create(input: CreatePostDto) {
    if (!input.authorId) throw new BadRequestException("Author ID is required");

    return await this.repository.store(input);
  }
  async index(options?: PostQueryDto) {
    return await this.repository.findAll(options);
  }
}
