/*
  Warnings:

  - You are about to drop the column `authorId` on the `activity-score` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "activity-score" DROP CONSTRAINT "activity-score_authorId_fkey";

-- AlterTable
ALTER TABLE "activity-score" DROP COLUMN "authorId";
