import { PrismaClient } from "@prisma/client";
import chalk from 'chalk';
import * as dotenv from "dotenv";
import { Seeds } from "./seeds/user";

const prisma = new PrismaClient();

async function main() {
  dotenv.config();

  console.info(
    chalk.bgYellow.white.bold("🌱 Database Seed start "),
  );
  const seed = new Seeds(prisma);

  // ============LIST OF SEED START============= //
  await seed.user()
  // ============LIST OF SEED END============= //

  console.info(
    chalk.bgYellow.white.bold("🌱 Database Seed successfully 😍"),
  );
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
