import { GetUser, GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { successResponse } from "@common/utils/response.util";
import { postFrom } from "@constants/enums";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiExtraModels, ApiOperation } from "@nestjs/swagger";
import { S3Service } from "@s3/s3.service";
import { TUser, VerifiedUser } from "@type/index";
import { omit } from "@utils/index";
import { transformAndValidate } from "@utils/zod-utility/transform-validation";
import multer from "multer";
import { CreatePostDto, UpdatePostDto } from "./dto/create.post.dto";
import { PostQueryDto } from "./dto/posts.query.dto";
import { fromDataExample } from "./example";
import { PostService } from "./posts.service";
import { PostUtils } from "./utils";

@ApiBearerAuth()
@Controller("posts")
@ApiExtraModels(CreatePostDto)
export class PostController {
    constructor(
        private readonly service: PostService,
        private readonly s3Service: S3Service,
        private readonly utils: PostUtils,
    ) {}

    @Post()
    @ApiOperation({ summary: "Create a new post" })
    @ApiConsumes("multipart/form-data")
    @ApiBody(fromDataExample)
    @UseInterceptors(
        FilesInterceptor("files", 20, {
            storage: multer.memoryStorage(),
            limits: { files: 20 },
        }),
    )
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async store(
        @GetVerifiedUser() user: VerifiedUser,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() req: any,
    ) {
        try {
            const mediaUrls = files?.length ? await this.s3Service.uploadFiles(files) : [];
            const extractMetaData = JSON.parse(req.metadata);
            const body = omit(req, ["files"]);
            const tagged = body.taggedUserIds && this.utils.extractTagsId(body.taggedUserIds);

            const createInput = {
                ...body,
                authorId: user.id,
                taggedUserIds: tagged,
                postFrom: this.utils.include(postFrom, body.postFrom),
                metadata: extractMetaData,
                mediaUrls,
                // boolean
                acceptVolunteer: this.utils.extractBoolean(body.acceptVolunteer),
                acceptDonation: this.utils.extractBoolean(body.acceptDonation),
            };

            const validated = await transformAndValidate(CreatePostDto, createInput);

            const post = await this.service.create(validated);
            return successResponse(post, "Post created successfully");
        } catch (err) {
            throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get()
    @ApiOperation({ summary: "Get all posts" })
    @UsePipes(PostQueryDto)
    async index(@Query() query: PostQueryDto) {
        try {
            const posts = await this.service.index(query);
            return posts;
        } catch (err) {
            return err;
        }
    }

    @Get("share-link/:id")
    @ApiOperation({ summary: "Generate shareable post url" })
    @UseGuards(JwtAuthGuard)
    async shareLink(@Param("id", ParseUUIDPipe) id: string) {
        try {
            if (!id)
                throw new NotFoundException("Post ID not found", {
                    description: "Provided params are not valid / not found!",
                });

            const link = await this.service.generateLink(id);
            return successResponse(link, "Post shareable link generated");
        } catch (err) {
            return err;
        }
    }

    @Put(":id")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Update a post" })
    async update(
        @Param("id", ParseUUIDPipe) id: string,
        @GetUser() user: TUser,
        @Body() body: UpdatePostDto,
    ) {
        try {
            const updatedPost = await this.service.update(id, body, user.userId);
            return successResponse(updatedPost, "Post updated successfully");
        } catch (err) {
            return err;
        }
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Delete a post" })
    async delete(@Param("id", ParseUUIDPipe) id: string, @GetVerifiedUser() user: VerifiedUser) {
        await this.service.delete(id, user.id);
        return successResponse(null, "Post deleted successfully");
    }
    @Get("users-post")
    @UseGuards(JwtAuthGuard)
    async get_user_all_post(@GetUser() user: any) {
        try {
            const res = await this.service.get_all_post_of_user(user.userId);
            return {
                status: HttpStatus.ACCEPTED,
                message: "You post retrive succesfull",
                data: res,
            };
        } catch (err) {
            throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        }
    }
    @Get(":id")
    @ApiOperation({ summary: "Get a single post by ID" })
    async findOne(@Param("id", ParseUUIDPipe) id: string) {
        const post = await this.service.findOne(id);
        return successResponse(post, "Post retrieved successfully");
    }
}
