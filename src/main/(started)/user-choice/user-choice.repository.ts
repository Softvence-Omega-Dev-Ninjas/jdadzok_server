import { Injectable } from "@nestjs/common";
import { HelperTx } from "@project/@types";
import { CreateUserChoiceDto } from "./dto/user-choice.dto";

@Injectable()
export class UserChoiceRepository {

  async findUnique(tx: HelperTx, input: CreateUserChoiceDto) {
    return await tx.userChoice.findUnique({
      where: {
        userId_choiceId: input
      }
    });
  }

  async create(tx: HelperTx, input: CreateUserChoiceDto) {
    return await tx.userChoice.create({
      data: input,
    })
  }

  async upsert(tx: HelperTx, input: CreateUserChoiceDto) {
    return await tx.userChoice.upsert({
      where: {
        userId_choiceId: input
      },
      update: {},
      create: input
    })
  }

  async delete(tx: HelperTx, where: CreateUserChoiceDto) {
    return await tx.userChoice.delete({
      where: {
        userId_choiceId: where
      }
    })
  }
}
