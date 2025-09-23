import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { preChoices } from "./constants";

type TPrimsa = PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
export class Seeds {
  private prisma: TPrimsa;
  constructor(prisma: TPrimsa) {
    this.prisma = prisma;
  }

  public user = async () => {
    const data = () => ({
      email: faker.person.fullName(),
    });
    const usersArray = Array.from({ length: 5 }, data);
    await this.prisma.user.createMany({
      data: usersArray,
      skipDuplicates: true,
    });
  };

  public choice = async () => {
    await this.prisma.choice.createMany({
      data: preChoices,
      skipDuplicates: true,
    });
  };
  public aboutUs = async () => {
    const exists = await this.prisma.aboutUs.findFirst();
    if (exists) return; // Skip if already seeded

    const data: Prisma.AboutUsCreateInput = {
      about: faker.lorem.paragraphs(2),
      photos: [
        faker.image.urlLoremFlickr({ category: "nature" }),
        faker.image.urlLoremFlickr({ category: "city" }),
      ],
    };

    await this.prisma.aboutUs.create({ data });
  };
  public privacyPolicy = async () => {
    const exists = await this.prisma.privacyPolicy.findFirst();
    if (exists) return;

    await this.prisma.privacyPolicy.create({
      data: {
        text: `# Privacy Policy\n\n${faker.lorem.paragraphs(3)}`,
      },
    });
  };

  public termsAndConditions = async () => {
    const exists = await this.prisma.termsAndConditions.findFirst();
    if (exists) return;

    await this.prisma.termsAndConditions.create({
      data: {
        text: `# Terms and Conditions\n\n${faker.lorem.paragraphs(3)}`,
      },
    });
  };
}
