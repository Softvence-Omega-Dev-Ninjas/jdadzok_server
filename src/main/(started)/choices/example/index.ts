import { ApiBodyOptions } from "@nestjs/swagger";
import { CreateChoiceDto } from "../dto/choices.create.dto";

export const choicesBodyOptions: ApiBodyOptions = {
  isArray: true,
  type: CreateChoiceDto,
  description: "An array of choice objects",
  examples: {
    example1: {
      value: [
        {
          text: "Life Hacks"
        },
        {
          text: "Productivity"
        },
      ],
    },
    example2: {
      value: [
        {
          text: "Science & Education"
        },
        {
          text: "Productivity"
        },
      ],
    },
  },
};
