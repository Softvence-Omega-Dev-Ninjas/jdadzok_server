/*
  Warnings:

  - You are about to drop the column `isToggleNotification` on the `ngo_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ngo_profiles" DROP COLUMN "isToggleNotification";

-- AlterTable
ALTER TABLE "ngos" ADD COLUMN     "isToggleNotification" BOOLEAN NOT NULL DEFAULT false;
