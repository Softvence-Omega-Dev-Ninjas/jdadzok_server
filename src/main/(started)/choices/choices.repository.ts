import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Choice } from "@prisma/client";
import { HelperTx } from "@project/@types";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { UserChoiceRepository } from "../user-choice/user-choice.repository";
import { CreateChoiceDto } from "./dto/choices.create.dto";

@Injectable()
export class ChoicesRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userChoiceRepository: UserChoiceRepository,
  ) { }

  /**
   * Find a choice by its slug
   */
  async findBySlug(tx: HelperTx, slug: string) {
    return await tx.choice.findUnique({ where: { slug } });
  }
  /**
   * Create a choice
   */
  async create(tx: HelperTx, input: CreateChoiceDto) {
    return await tx.choice.create({
      data: {
        text: input.text,
        slug: input.slug!,
      },
    });
  }
  /**
   * Create multiple choices + user-choice relations
   * Ensures uniqueness per user
   */
  async createMany(data: Required<CreateChoiceDto[]>) {
    return await this.prisma.$transaction(async (tx) => {
      const results: Choice[] = [];
      for (const choiceDto of data) {
        let choice = await this.findBySlug(tx, choiceDto.slug!);

        // make sure that user not providing out of our prechoices.
        if (!choice)
          throw new ConflictException("Choice must need to be in our list");

        // Check if this user already has this choice
        const existingUserChoice = await this.userChoiceRepository.findUnique(
          tx,
          { userId: choiceDto.userId!, choiceId: choice.id },
        );

        if (!existingUserChoice)
          await this.userChoiceRepository.create(tx, {
            userId: choiceDto.userId!,
            choiceId: choice.id,
          });

        results.push(choice);
      }

      return results;
    });
  }

  async findManyByUserId(userId: CreateChoiceDto["userId"]) {
    return await this.prisma.choice.findMany({
      where: {
        userChoices: {
          some: { userId },
        },
      },
    });
  }

  async delete(userId: string, slug: string) {
    return await this.prisma.$transaction(async (tx) => {
      const choice = await this.findBySlug(tx, slug);
      if (!choice) throw new NotFoundException(`Choice '${slug}' not found`);

      await this.userChoiceRepository.delete(tx, {
        choiceId: choice.id,
        userId,
      });
    });
  }

  async findMany() {
    return await this.prisma.choice.findMany({
      include: {
        userChoices: {
          include: {
            choice: true,
            user: true
          }
        }
      }
    })
  }
}
