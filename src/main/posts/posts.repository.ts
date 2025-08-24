import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { QueryDto } from "@project/services/dto/query.dto";
import queryBuilderService from "@project/services/query-builder.service";
import { Merge } from 'type-fest';
import { CreatePostDto } from "./dto/post.dto";
import { PostQueryDto } from "./dto/post.query.dto";

@Injectable()
export class PostRepository {
    constructor(private readonly prisma: PrismaService) { }

    async store(input: CreatePostDto) {
        return await this.prisma.post.create({
            data: {
                text: "This is a brand new post 🚀",
                author: {
                    connect: {
                        id: input.author_id,
                    }
                },
                category: {
                    connect: {
                        id: input.category_id
                    }
                },
            },
            include: {
                metadata: true,
                author: true,
                category: true
            }
        })
    }
    async findAll(options?: Merge<PostQueryDto, QueryDto>) {
        const safeOptions = {
            page: options?.page ?? 1,
            limit: options?.limit ?? 10,
            ...options
        }

        const query = queryBuilderService.buildQuery<Prisma.PostWhereInput, Prisma.PostInclude, PostQueryDto>(safeOptions)
        return await this.prisma.post.findMany({ ...query })
    }
}