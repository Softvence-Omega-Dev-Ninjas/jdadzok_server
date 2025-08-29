import { config } from 'dotenv';
import path from "path";
import { defineConfig } from "prisma/config";


config();
export default defineConfig({
    schema: path.join('prisma', 'schema.prisma'),
    migrations: {
        path: path.join("prisma", "migrations"),
        // TODO: add here seed file
        // seed: "tsx db/seed.ts"
    },
    views: {
        path: path.join("prisma", "views"),
    },
    typedSql: {
        path: path.join("prisma", "queries"),
    },
})