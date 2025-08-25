import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import queryBuilderService from "@project/services/query-builder.service";
import { CreatePostDto } from "./dto/post.dto";
import { PostQueryDto } from "./dto/posts.query.dto";

@Injectable()
export class PostRepository {
    constructor(private readonly prisma: PrismaService) { }

    async store(input: CreatePostDto) {
        return await this.prisma.post.create({
            data: {
                text: input.text,
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
    async findAll(options?: PostQueryDto) {
        const safeOptions = {
            include: {
                metadata: options?.metadata ?? false,
                author: options?.author ?? false,
                category: options?.category ?? false
            },
            orderBy: {
                [options?.sortBy ?? "createdAt"]: "asc"
            },
            ...options
        }
        const query = queryBuilderService.buildQuery<Prisma.PostWhereInput, Prisma.PostInclude, PostQueryDto>(safeOptions, (search) => ({
            OR: [
                {
                    text: {
                        contains: search,
                        mode: "insensitive",
                    }
                }
            ]
        }))
        return await this.prisma.post.findMany({
            ...query,
            skip: 0
        })
    }
}