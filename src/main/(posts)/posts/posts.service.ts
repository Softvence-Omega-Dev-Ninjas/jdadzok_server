import { Injectable } from "@nestjs/common";
import { CreatePostDto } from "./dto/post.dto";
import { PostQueryDto } from "./dto/posts.query.dto";
import { PostRepository } from "./posts.repository";

@Injectable()
export class PostService {
  constructor(private readonly repository: PostRepository) {}

  async create(input: CreatePostDto) {
    return await this.repository.store(input);
  }
  async index(options?: PostQueryDto) {
    return await this.repository.findAll(options);
  }
}
