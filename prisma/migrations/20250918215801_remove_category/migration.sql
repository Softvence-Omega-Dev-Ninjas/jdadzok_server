/*
  Warnings:

  - You are about to drop the column `category` on the `choices` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `choices` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."choices_category_idx";

-- AlterTable
ALTER TABLE "public"."choices" DROP COLUMN "category",
DROP COLUMN "description";
