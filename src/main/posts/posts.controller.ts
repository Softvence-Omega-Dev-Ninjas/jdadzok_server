import { Controller, Get, Post } from "@nestjs/common";

@Controller("posts")
export class PostController {
    constructor() {
    }

    @Post()
    async store() { }

    @Get()
    async index() { }
}