import { createZodDto } from '@anatine/zod-nestjs';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import z from "zod";

extendZodWithOpenApi(z);
export const createPostSchema = z.object({
    text: z.string().openapi({ example: "Our post text" }),
    media_url: z.string().openapi({ example: "https://*/*" })
})
export type CreatePostSchemaDto = z.infer<typeof createPostSchema>
export class CreatePostDto extends createZodDto(createPostSchema) { }