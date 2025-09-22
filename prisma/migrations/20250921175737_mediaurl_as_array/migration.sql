/*
  Warnings:

  - You are about to drop the column `mediaUrl` on the `posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."posts" DROP COLUMN "mediaUrl",
ADD COLUMN     "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "text" DROP NOT NULL;
