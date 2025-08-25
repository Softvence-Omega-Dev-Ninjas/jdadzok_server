import { Body, Controller, Get, Post } from "@nestjs/common";
import { PostMetadataService } from "./post.metadata.service";

@Controller("posts/metadata")
export class PostMetadataController {
    constructor(private readonly service: PostMetadataService) { }

    @Post()
    async store(@Body() body: any) {
        try {
            // const metadata = await this.service.store(body)
            return body
        } catch (err) {
            return err
        }
    }
    @Get()
    async findOne() {
        return 'hello'
    }
}