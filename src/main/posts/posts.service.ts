import { Injectable } from "@nestjs/common";
import { QueryDto } from "@project/services/dto/query.dto";
import { Merge } from "type-fest";
import { CreatePostDto } from "./dto/post.dto";
import { PostQueryDto } from "./dto/post.query.dto";
import { PostRepository } from "./posts.repository";

@Injectable()
export class PostService {
    constructor(private readonly repository: PostRepository) { }

    async create(input: CreatePostDto) {
        return await this.repository.store(input);
    }
    async index(options?: Merge<PostQueryDto, QueryDto>) {
        return await this.repository.findAll(options);
    }
}