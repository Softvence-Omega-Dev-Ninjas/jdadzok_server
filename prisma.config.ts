import { config } from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

// Explicitly load environment variables
config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: path.join("prisma", "schema"),

  migrations: {
    path: path.join("prisma", "migrations"),

    seed: "tsx prisma/seed.ts", // optional

    // seed: "tsx prisma/seed.ts", // optional
  },
  views: {
    path: path.join("prisma", "views"),
  },
  typedSql: {
    path: path.join("prisma", "queries"),
  },
});
