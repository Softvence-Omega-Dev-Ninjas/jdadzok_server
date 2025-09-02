import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema"),

  migrations: {
    path: path.join("prisma", "migrations"),

    seed: "tsx prisma/seed.ts", // optional
  },
  views: {
    path: path.join("prisma", "views"),
  },
  typedSql: {
    path: path.join("prisma", "queries"),
  },
});
