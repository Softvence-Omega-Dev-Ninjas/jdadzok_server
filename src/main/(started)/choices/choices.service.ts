import { BadRequestException, Injectable } from "@nestjs/common";
import { ChoicesRepository } from "./choices.repository";
import { CreateChoiceDto } from "./dto/choices.create.dto";
import { parseChoiceInput } from "./utils";

@Injectable()
export class ChoicesService {
  constructor(private readonly choicesRepo: ChoicesRepository) {}

  async assignChoices(userId: string, dtos: CreateChoiceDto[]) {
    // max 5 choices
    const existing = await this.choicesRepo.findAll(userId);
    if (existing.length + dtos.length > 5) {
      throw new BadRequestException("You can select at most 5 choices.");
    }

    return this.choicesRepo.createMany(parseChoiceInput(userId, dtos));
  }

  async getUserChoices(userId: string) {
    return this.choicesRepo.findAll(userId);
  }

  async removeChoice(userId: string, slug: string) {
    return this.choicesRepo.delete(userId, slug);
  }
}
