import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { HelperTx } from "@project/@types";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import queryBuilderService from "@project/services/query-builder.service";
import { GifRepository } from "../gif/gif.repository";
import { LocationRepository } from "../locations/locations.repository";
import { CreatePostMetadataDto } from "../post-metadata/dto/post.metadata.dto";
import { PostMetadataRepository } from "../post-metadata/post.metadata.repository";
import { PostTagsRepository } from "../post-tags/post-tags.repository";
import { CreatePostDto, UpdatePostDto } from "./dto/create.post.dto";
import { PostQueryDto } from "./dto/posts.query.dto";

@Injectable()
export class PostRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tagsRepo: PostTagsRepository,
    private readonly locationRepo: LocationRepository,
    private readonly gifRepo: GifRepository,
    private readonly metadataRepo: PostMetadataRepository,
  ) {}

  private readonly defaultInclude = {
    metadata: {
      include: {
        gif: true,
        checkIn: true,
      },
    },
  };

  async store(input: CreatePostDto) {
    const { metadata, taggedUserIds, ...postData } = input;
    return this.prisma.$transaction(async (tx) => {
      let metadataId = input.metadataId;

      if (metadata && !metadataId) {
        metadataId = await this.createMetadata(tx, metadata);
      }

      const postForAuthor = await tx.post.create({
        data: {
          ...postData,
          authorId: postData.authorId!,
          metadataId,
        },
      });

      if (taggedUserIds && taggedUserIds.length > 0) {
        await this.handleTaggedUsers(
          tx,
          taggedUserIds,
          input,
          metadataId,
          postForAuthor.id,
        );
      }

      return tx.post.findUnique({
        where: { id: postForAuthor.id },
        include: this.defaultInclude,
      });
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
        [options?.sortBy ?? "createdAt"]: options?.sortOrder ?? "desc",
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

    return this.prisma.post.findMany({
      ...query,
      skip: safeOptions.skip ?? 0,
      take: safeOptions.take ?? 20,
      include: { ...this.defaultInclude },
    });
  }

  async findById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  async update(id: string, data: UpdatePostDto) {
    return await this.prisma.$transaction(async (tx) => {
      const { metadata, ...input } = data;
      let updatedMetadataId = input.metadataId;

      if (metadata) {
        // Update or create metadata if it exists in the DTO
        updatedMetadataId = await this.updateOrCreateMetadata(
          tx,
          input.metadataId!,
          metadata,
        );
      } else if (input.metadataId && !metadata) {
        await this.cleanupMetadata(tx, input.metadataId);
        updatedMetadataId = undefined;
      }

      const updatedPost = await tx.post.update({
        where: {
          id,
          authorId: input.authorId!,
        },
        data: {
          ...input,
          metadataId: updatedMetadataId,
        },
        include: this.defaultInclude,
      });
      return updatedPost;
    });
  }

  async delete(id: string) {
    return await this.prisma.$transaction(async (tx) => {
      await tx.postTagUser.deleteMany({
        where: { postId: id },
      });

      const deletedPost = await tx.post.delete({
        where: { id },
        include: this.defaultInclude,
      });

      if (deletedPost.metadataId) {
        const otherPostsWithSameMetadata = await tx.post.count({
          where: {
            metadataId: deletedPost.metadataId,
            id: { not: id },
          },
        });

        if (otherPostsWithSameMetadata === 0) {
          await this.cleanupMetadata(tx, deletedPost.metadataId);
        }
      }

      return deletedPost;
    });
  }

  private async updateOrCreateMetadata(
    tx: HelperTx,
    metadataId: string | undefined,
    metadataDto: CreatePostMetadataDto,
  ) {
    if (metadataId) {
      // update existing metadata
      const existingMetadata = await tx.postMetadata.findUnique({
        where: { id: metadataId },
        include: { checkIn: true, gif: true },
      });

      if (!existingMetadata) {
        // This is an edge case, but it's good practice to handle it.
        // If the metadata ID is invalid, create new metadata instead.
        return this.createMetadata(tx, metadataDto);
      }

      let newLocationId = existingMetadata.checkInId;
      if (metadataDto.checkIn) {
        const location = await this.locationRepo.txStore(
          tx,
          metadataDto.checkIn,
        );
        newLocationId = location.id;
      } else if (!metadataDto.checkIn) {
        // If checkIn is explicitly null, delete the old location
        if (existingMetadata.checkInId) {
          await this.cleanupLocation(
            tx,
            existingMetadata.checkInId,
            metadataId,
          );
        }
        newLocationId = null;
      }

      let newGifId = existingMetadata.gifId;
      if (metadataDto.gif) {
        const gif = await this.gifRepo.txStore(tx, metadataDto.gif);
        newGifId = gif.id;
      } else if (!metadataDto.gif) {
        // If gif is explicitly null, delete the old gif
        if (existingMetadata.gifId) {
          await this.cleanupGif(tx, existingMetadata.gifId, metadataId);
        }
        newGifId = null;
      }

      const updatedMetadata = await this.metadataRepo.txUpdate(tx, metadataId, {
        ...metadataDto,
        checkInId: newLocationId!,
        gifId: newGifId!,
      });

      return updatedMetadata.id;
    } else {
      // create new metadata since none existed before
      return this.createMetadata(tx, metadataDto);
    }
  }

  private async createMetadata(
    tx: HelperTx,
    metadata: CreatePostMetadataDto,
  ): Promise<string> {
    let locationId: string | undefined;
    let gifId: string | undefined;

    if (metadata.checkIn) {
      const location = await this.locationRepo.txStore(tx, metadata.checkIn);
      locationId = location.id;
    }

    if (metadata.gif) {
      const gif = await this.gifRepo.txStore(tx, metadata.gif);
      gifId = gif.id;
    }

    const postMetadata = await this.metadataRepo.txStore(tx, {
      checkInId: locationId,
      gifId,
      feelings: metadata.feelings ?? "HAPPY",
    });

    return postMetadata.id;
  }

  private async handleTaggedUsers(
    tx: HelperTx,
    taggedUserIds: string[],
    input: Omit<CreatePostDto, "metadata">,
    metadataId: string | undefined,
    originalPostId: string,
  ): Promise<void> {
    const tags = await Promise.all(
      taggedUserIds.map(async (userId) => {
        await tx.post.create({
          data: {
            ...input,
            authorId: userId,
            metadataId,
          },
        });

        return {
          postId: originalPostId,
          userId,
        };
      }),
    );

    await this.tagsRepo.txStore(tx, tags);
  }

  private async cleanupMetadata(
    tx: HelperTx,
    metadataId: string,
  ): Promise<void> {
    try {
      const metadata = await tx.postMetadata.findUnique({
        where: { id: metadataId },
        include: { checkIn: true, gif: true },
      });

      if (!metadata) return;

      if (metadata.checkInId) {
        await this.cleanupLocation(tx, metadata.checkInId, metadata.id);
      }

      if (metadata.gifId) {
        await this.cleanupGif(tx, metadata.gifId, metadata.id);
      }

      await tx.postMetadata.delete({ where: { id: metadataId } });
    } catch (error) {
      console.warn("Failed to cleanup metadata:", error);
    }
  }
  private async cleanupLocation(
    tx: HelperTx,
    locationId: string,
    currentMetadataId: string,
  ) {
    const count = await tx.postMetadata.count({
      where: {
        checkInId: locationId,
        id: {
          not: currentMetadataId,
        },
      },
    });
    if (count === 0) await tx.location.delete({ where: { id: locationId } });
  }
  private async cleanupGif(
    tx: HelperTx,
    gifId: string,
    currentMetadataId: string,
  ): Promise<void> {
    const count = await tx.postMetadata.count({
      where: {
        gifId: gifId,
        id: { not: currentMetadataId },
      },
    });

    if (count === 0) {
      await tx.gif.delete({ where: { id: gifId } });
    }
  }
}
