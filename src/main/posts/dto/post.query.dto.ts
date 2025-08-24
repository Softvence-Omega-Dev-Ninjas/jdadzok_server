import { createZodDto } from '@anatine/zod-nestjs';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import z from "zod";

extendZodWithOpenApi(z);
export const postQuerySchema =
    z.object({
        include: z.object({
            metadata: z.boolean().optional().default(true).openapi({ example: true }),
            author: z.boolean().optional().default(true).openapi({ example: true }),
            category: z.boolean().optional().default(true).openapi({ example: true })
        }).optional().openapi({ example: { metadata: true, author: true, category: true } })
    })


export type PostQuerySchema = z.infer<typeof postQuerySchema>;
export class PostQueryDto extends createZodDto(postQuerySchema) { }