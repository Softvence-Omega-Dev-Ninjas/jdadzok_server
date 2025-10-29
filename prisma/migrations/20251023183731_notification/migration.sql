/*
  Warnings:

  - You are about to drop the column `isToggleNotification` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "communities" ADD COLUMN     "isToggleNotification" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ngo_profiles" ADD COLUMN     "isToggleNotification" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "isToggleNotification" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isToggleNotification";
