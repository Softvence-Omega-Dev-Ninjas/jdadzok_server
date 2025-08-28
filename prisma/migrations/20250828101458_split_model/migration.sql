/*
  Warnings:

  - Made the column `postId` on table `likes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."likes" DROP CONSTRAINT "likes_postId_fkey";

-- AlterTable
ALTER TABLE "public"."likes" ALTER COLUMN "postId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
