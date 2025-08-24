/*
  Warnings:

  - Made the column `text` on table `posts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."posts" ALTER COLUMN "text" SET NOT NULL;
