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
          text: "Life Hacks",
          slug: "life-hacks", // this is optional
        },
        {
          name: "Productivity",
          slug: "productivity", // this is optional
        },
      ],
    },
    example2: {
      value: [
        {
          name: "Science & Education",
          slug: "science-education",
        },
        {
          name: "Productivity",
          slug: "productivity",
        },
      ],
    },
  },
};
