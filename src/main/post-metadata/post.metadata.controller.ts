import { Body, Controller, Post } from "@nestjs/common";

@Controller("posts/metadata")
export class PostMetadataController {
    // constructor(private readonly service: PostMetadataService) { }

    @Post()
    async store(@Body() body: any) {
        try {
            // const metadata = await this.service.store(body)
            return body
        } catch (err) {
            return err
        }
    }
    async findOne() {
        return 'hello'
    }
}