/*
  Warnings:

  - You are about to drop the `_NgoToVolunteerProject` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ngoId` to the `VolunteerProject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."_NgoToVolunteerProject" DROP CONSTRAINT "_NgoToVolunteerProject_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_NgoToVolunteerProject" DROP CONSTRAINT "_NgoToVolunteerProject_B_fkey";

-- AlterTable
ALTER TABLE "VolunteerProject" ADD COLUMN     "ngoId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."_NgoToVolunteerProject";

-- AddForeignKey
ALTER TABLE "VolunteerProject" ADD CONSTRAINT "VolunteerProject_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "ngos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
