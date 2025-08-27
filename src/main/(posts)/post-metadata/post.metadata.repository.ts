import { Injectable } from "@nestjs/common";
import { HelperTx } from "@project/@types";
import { CreatePostMetadataDto } from "./dto/post.metadata.dto";

@Injectable()
export class PostMetadataRepository {
  async txStore(tx: HelperTx, data: CreatePostMetadataDto) {
    return await tx.postMetadata.create({
      data: {
        checkInId: data.checkInId,
        gifId: data.gifId,
        feelings: data.feelings,
      },
    });
  }
}
