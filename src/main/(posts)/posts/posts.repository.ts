import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import queryBuilderService from "@project/services/query-builder.service";
import { GifRepository } from "../gif/gif.repository";
import { LocationRepository } from "../locations/locations.repository";
import { PostMetadataRepository } from "../post-metadata/post.metadata.repository";
import { PostTagsRepository } from "../post-tags/post-tags.repository";
import { CreatePostDto } from "./dto/create.post.dto";
import { PostQueryDto } from "./dto/posts.query.dto";

@Injectable()
export class PostRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tagsRepo: PostTagsRepository,
    private readonly locationRepo: LocationRepository,
    private readonly gifRepo: GifRepository,
    private readonly metadataRepo: PostMetadataRepository,
  ) { }

  async store(input: CreatePostDto) {
    const { taggedUserIds = [], metadata, ...data } = input;


    return this.prisma.$transaction(async (tx) => {
      let metadataId = input.metadataId;

      // Create metadata if provided as nested object
      if (metadata && !metadataId) {

        let locationId: string | undefined;
        let gifId: string | undefined;

        // Create location if provided
        if (metadata.checkIn) {
          const location = await this.locationRepo.txStore(
            tx,
            metadata.checkIn,
          );
          locationId = location.id;
        }

        // Create GIF if provided
        if (metadata.gif) {
          const gif = await this.gifRepo.txStore(tx, metadata.gif);
          gifId = gif.id;
        }

        // Create metadata
        const postMetaData = await this.metadataRepo.txStore(tx, {
          checkInId: locationId,
          gifId: gifId,
          feelings: metadata.feelings || "HAPPY",
        });
        metadataId = postMetaData.id;
      }

      // create post for author
      const postForAuthor = await tx.post.create({
        data: {
          ...data,
          authorId: input.authorId!,
          metadataId
        },
      });
      // create post for tagged user whos id has on the tagUsers array
      // and create the tagUser table
      if (taggedUserIds.length > 0) {
        const tags = await Promise.all(
          taggedUserIds.map(async (userId) => {
            await tx.post.create({
              data: {
                ...data,
                authorId: userId, // each user who has tagges
                metadataId
              },
            });

            return {
              postId: postForAuthor.id,
              userId,
            };
          }),
        );
        await this.tagsRepo.txStore(tx, tags);
      }

      // then finaly return post with include everything
      return postForAuthor;
    });
  }

  async findAll(options?: PostQueryDto) {
    const safeOptions = {
      include: {
        metadata: options?.metadata ?? true,
        author: options?.author ?? false,
        category: options?.category ?? false,
      },
      orderBy: {
        [options?.sortBy ?? "createdAt"]: "asc",
      },
      ...options,
    };
    const query = queryBuilderService.buildQuery<
      Prisma.PostWhereInput,
      Prisma.PostInclude,
      PostQueryDto
    >(safeOptions, (search) => ({
      OR: [
        {
          text: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }));
    return await this.prisma.post.findMany({
      ...query,
      skip: 0,
      include: {
        metadata: {
          include: {
            gif: true,
            checkIn: true
          }
        },
      }
    });
  }
}
