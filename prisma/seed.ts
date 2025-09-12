import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import path from "path";
import { Seeds } from "./seeds/user";

// Explicitly load environment variables
const prisma = new PrismaClient();
async function main() {

  expand(config({ path: path.resolve(process.cwd(), ".env") }))
  console.info(chalk.bgYellow.white.bold("🌱 Database Seed start "));
  const seed = new Seeds(prisma);

  // ============LIST OF SEED START============= //
  await seed.user();
  // ============LIST OF SEED END============= //

  console.info(chalk.bgYellow.white.bold("🌱 Database Seed successfully 😍"));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
