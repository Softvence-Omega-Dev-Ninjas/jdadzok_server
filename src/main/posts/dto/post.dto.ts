import { createZodDto } from '@anatine/zod-nestjs';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { Feelings, MediaType, PostVisibility } from '@project/constants';
import { enumField, requiredString } from '@project/utils/zod-utility';
import z from 'zod';

extendZodWithOpenApi(z);

// -----------------------------------
// CATEGORY DTOs
// -----------------------------------

export const createCategorySchema = z.object({
    name: requiredString('name').openapi({ example: 'New Technology' }),
    slug: z.string().optional().openapi({ example: 'new-tech', description: 'we will extract from name' }),
});

export const updateCategorySchema = z.object({
    name: requiredString('name').openapi({ example: 'New Technology' }),
    slug: z.string().optional().openapi({ example: 'new-tech', description: 'we will extract from name' }),
});

export const categorySchema = z.object({
    id: z.string().uuid().openapi({ example: 'uuid' }),
    name: z.string().openapi({ example: 'Technology' }),
    slug: z.string().openapi({ example: 'tech' }),
    createdAt: z.string().datetime().openapi({ example: '2022-01-01T00:00:00Z' }),
    updatedAt: z.string().datetime().openapi({ example: '2022-01-01T00:00:00Z' }),
});

export class CreateCategoryDto extends createZodDto(createCategorySchema) { }
export class UpdateCategoryDto extends createZodDto(updateCategorySchema) { }
export class CategoryDto extends createZodDto(categorySchema) { }

// -----------------------------------
// POST METADATA DTOs
// -----------------------------------

export const postMetadataSchema = z.object({
    feelings: enumField(Feelings, 'feelings').default('HAPPY'),
    check_in_id: z.string().uuid().optional(),
    gif_id: z.string().uuid().optional(),
});

export class PostMetadataDto extends createZodDto(postMetadataSchema) { }

// -----------------------------------
// POST DTOs
// -----------------------------------

export const createPostSchema = z.object({
    author_id: z.string().uuid().openapi({ example: '8b85e912-1be2-4caa-a94a-f529d040e14d' }), // TODO: it should be uuid as we wrote in model
    category_id: z.string().optional().openapi({ example: '68dc07dc-1e58-4a44-ac36-f4ddf23eafe4' }),
    text: requiredString('text').openapi({ example: 'Our post text' }),
    media_url: z.string().optional().openapi({ example: 'https://example.com/media.jpg' }),
    media_type: enumField(MediaType, 'media_type'),
    visibility: enumField(PostVisibility, 'visibility'),
    metadata: postMetadataSchema.optional(),
});

export const updatePostSchema = z.object({
    text: z.string().optional(),
    media_url: z.string().optional(),
    media_type: enumField(MediaType, 'media_type').optional(),
    visibility: enumField(PostVisibility, 'visibility').optional(),
    metadata: postMetadataSchema.optional(),
    // TODO: put here rest of the relational model
});

export const postSchema = z.object({
    id: z.string().uuid().openapi({ example: 'uuid' }),
    author_id: z.string().uuid().openapi({ example: 'uuid' }),
    category_id: z.string().uuid().optional().openapi({ example: 'uuid' }),
    text: z.string().openapi({ example: 'Our post text' }),
    media_url: z.string().optional().openapi({ example: 'https://example.com/media.jpg' }),
    media_type: enumField(MediaType, 'media_type'),
    visibility: enumField(PostVisibility, 'visibility'),
    createdAt: z.string().datetime().openapi({ example: '2022-01-01T00:00:00Z' }),
    updatedAt: z.string().datetime().openapi({ example: '2022-01-01T00:00:00Z' }),
});

export class CreatePostDto extends createZodDto(createPostSchema) { }
export class UpdatePostDto extends createZodDto(updatePostSchema) { }
export class PostDto extends createZodDto(postSchema) { }

// -----------------------------------
// COMMENT DTOs
// -----------------------------------

export const createCommentSchema = z.object({
    post_id: z.string().uuid().openapi({ example: 'uuid' }),
    parent_comment_id: z.string().uuid().optional().openapi({ example: 'uuid' }),
    author_id: z.string().uuid().openapi({ example: 'uuid' }),
    text: requiredString('text').openapi({ example: 'Great post!' }),
});

export const commentSchema = z.object({
    id: z.string().uuid().openapi({ example: 'uuid' }),
    post_id: z.string().uuid().openapi({ example: 'uuid' }),
    parent_comment_id: z.string().uuid().optional().openapi({ example: 'uuid' }),
    author_id: z.string().uuid().openapi({ example: 'uuid' }),
    text: z.string().openapi({ example: 'Great post!' }),
    createdAt: z.string().datetime().openapi({ example: '2022-01-01T00:00:00Z' }),
    updatedAt: z.string().datetime().openapi({ example: '2022-01-01T00:00:00Z' }),
});

export class CreateCommentDto extends createZodDto(createCommentSchema) { }
export class CommentDto extends createZodDto(commentSchema) { }

// -----------------------------------
// LIKE DTOs
// -----------------------------------

export const createLikeSchema = z.object({
    user_id: z.string().uuid().openapi({ example: 'uuid' }),
    post_id: z.string().uuid().optional().openapi({ example: 'uuid' }),
    comment_id: z.string().uuid().optional().openapi({ example: 'uuid' }),
});

export const likeSchema = z.object({
    id: z.string().uuid().openapi({ example: 'uuid' }),
    user_id: z.string().uuid().openapi({ example: 'uuid' }),
    post_id: z.string().uuid().optional().openapi({ example: 'uuid' }),
    comment_id: z.string().uuid().optional().openapi({ example: 'uuid' }),
    createdAt: z.string().datetime().openapi({ example: '2022-01-01T00:00:00Z' }),
    updatedAt: z.string().datetime().openapi({ example: '2022-01-01T00:00:00Z' }),
});

export class CreateLikeDto extends createZodDto(createLikeSchema) { }
export class LikeDto extends createZodDto(likeSchema) { }

// -----------------------------------
// SHARE DTOs
// -----------------------------------

export const createShareSchema = z.object({
    user_id: z.string().uuid().openapi({ example: 'uuid' }),
    post_id: z.string().uuid().openapi({ example: 'uuid' }),
});

export const shareSchema = z.object({
    id: z.string().uuid().openapi({ example: 'uuid' }),
    user_id: z.string().uuid().openapi({ example: 'uuid' }),
    post_id: z.string().uuid().openapi({ example: 'uuid' }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export class CreateShareDto extends createZodDto(createShareSchema) { }
export class ShareDto extends createZodDto(shareSchema) { }

