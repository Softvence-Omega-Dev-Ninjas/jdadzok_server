import { slugify } from "@project/utils";
import { CreateChoiceDto } from "../dto/choices.create.dto";

export const parseChoiceInput = (userId: string, input: CreateChoiceDto[]) => {
  return input
    .map((choice: any) => {
      if (!choice.text || typeof choice.text !== "string") return null;

      return {
        ...choice,
        slug: slugify(choice.text),
        userId,
      };
    })
    .filter(Boolean);
};
