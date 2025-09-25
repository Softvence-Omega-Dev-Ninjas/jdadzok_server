import { Injectable } from "@nestjs/common";
import { PostsMetricsRepository } from "./posts-metrics.repository";
import { CreatePostsMetricsDto } from "./dto/posts-metrics.dto";

@Injectable()
export class PostsMetricsService {
    constructor(private readonly postsMetricsRepository: PostsMetricsRepository) {}

    async create(input: CreatePostsMetricsDto) {
        // need be all login implement here...
        return await this.postsMetricsRepository.create(input);
    }

    async get(userId: string) {
        return await this.postsMetricsRepository.get(userId);
    }
}
