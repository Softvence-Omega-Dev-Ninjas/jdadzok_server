import { Injectable } from "@nestjs/common";
import { HelperTx } from "@project/@types";
import { CreateLocationDto } from "./dto/create.location.dto";

@Injectable()
export class LocationRepository {
    constructor() {}

    async txStore(tx: HelperTx, data: CreateLocationDto) {
        return await tx.location.create({ data });
    }
}
