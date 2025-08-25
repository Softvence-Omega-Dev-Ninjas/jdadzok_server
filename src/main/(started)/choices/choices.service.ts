import { Injectable } from "@nestjs/common";
import { ChoicesRepository } from "./choices.repository";
import { CreateChoiceDto } from "./dto/choices.create.dto";
import { parseChoiceInput } from "./utils";

@Injectable()
export class ChoicesService {
    constructor(private readonly repository: ChoicesRepository) { }

    async create(userId: string, input: CreateChoiceDto[]) {
        const choices = await this.repository.createMany(parseChoiceInput(userId, input));
        return choices
    }
}