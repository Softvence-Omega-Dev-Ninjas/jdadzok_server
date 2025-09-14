import { Injectable } from "@nestjs/common";
import { HelperTx } from "@project/@types";
import { CreateGifDto } from "./dto/create.gif.dto";

@Injectable()
export class GifRepository {
  constructor() {}

  async txStore(tx: HelperTx, data: CreateGifDto) {
    return await tx.gif.create({ data });
  }
}
