import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

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
}
