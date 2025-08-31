import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

const prisma = new PrismaClient();

const user = () => ({
  email: faker.person.fullName(),
});

async function main() {
  dotenv.config();
  console.log("Seeding...");
  const users = Array.from({ length: 5 }, user);
  await prisma.user.createMany({ data: users });
  console.log("Seeded!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
