/*
  Warnings:

  - The values [TEXT] on the enum `MediaType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."MediaType_new" AS ENUM ('IMAGE', 'VIDEO', 'GIF');
ALTER TABLE "public"."comments" ALTER COLUMN "mediaType" DROP DEFAULT;
ALTER TABLE "public"."posts" ALTER COLUMN "mediaType" DROP DEFAULT;
ALTER TABLE "public"."comments" ALTER COLUMN "mediaType" TYPE "public"."MediaType_new" USING ("mediaType"::text::"public"."MediaType_new");
ALTER TABLE "public"."messages" ALTER COLUMN "mediaType" TYPE "public"."MediaType_new" USING ("mediaType"::text::"public"."MediaType_new");
ALTER TABLE "public"."posts" ALTER COLUMN "mediaType" TYPE "public"."MediaType_new" USING ("mediaType"::text::"public"."MediaType_new");
ALTER TYPE "public"."MediaType" RENAME TO "MediaType_old";
ALTER TYPE "public"."MediaType_new" RENAME TO "MediaType";
DROP TYPE "public"."MediaType_old";
ALTER TABLE "public"."comments" ALTER COLUMN "mediaType" SET DEFAULT 'IMAGE';
ALTER TABLE "public"."posts" ALTER COLUMN "mediaType" SET DEFAULT 'IMAGE';
COMMIT;

-- AlterTable
ALTER TABLE "public"."comments" ALTER COLUMN "mediaType" SET DEFAULT 'IMAGE';

-- AlterTable
ALTER TABLE "public"."posts" ALTER COLUMN "mediaType" DROP NOT NULL,
ALTER COLUMN "mediaType" SET DEFAULT 'IMAGE';
