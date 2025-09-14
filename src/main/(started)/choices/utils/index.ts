import { slugify } from "@project/utils";
import { PreChoices } from "../constants";
import { CreateChoiceDto } from "../dto/choices.create.dto";

export const parseChoiceInput = (
  userId: string,
  input: CreateChoiceDto[],
): CreateChoiceDto[] => {
  return input
    .map((choice: PreChoices) => {
      return {
        ...choice,
        slug: slugify(choice.text),
        userId,
      };
    })
    .filter(Boolean);
};
