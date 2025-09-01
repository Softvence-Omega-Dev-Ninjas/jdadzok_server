/*
  Warnings:

  - You are about to drop the column `sharedProfileId` on the `communityMembership` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."communityMembership" DROP CONSTRAINT "communityMembership_sharedProfileId_fkey";

-- AlterTable
ALTER TABLE "public"."communityMembership" DROP COLUMN "sharedProfileId";
