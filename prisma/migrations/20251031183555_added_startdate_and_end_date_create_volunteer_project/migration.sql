/*
  Warnings:

  - You are about to drop the column `availableStartDate` on the `VolunteerApplication` table. All the data in the column will be lost.
  - You are about to drop the column `coverLetter` on the `VolunteerApplication` table. All the data in the column will be lost.
  - You are about to drop the column `totalHoursWorked` on the `VolunteerApplication` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `VolunteerApplication` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `VolunteerProject` table. All the data in the column will be lost.
  - You are about to drop the column `ngoId` on the `VolunteerProject` table. All the data in the column will be lost.
  - You are about to drop the column `remoteAllowed` on the `VolunteerProject` table. All the data in the column will be lost.
  - You are about to drop the column `requiredSkills` on the `VolunteerProject` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `VolunteerProject` table. All the data in the column will be lost.
  - You are about to drop the column `timeCommitment` on the `VolunteerProject` table. All the data in the column will be lost.
  - Added the required column `volunteerId` to the `VolunteerApplication` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."VolunteerApplication" DROP CONSTRAINT "VolunteerApplication_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VolunteerProject" DROP CONSTRAINT "VolunteerProject_ngoId_fkey";

-- DropIndex
DROP INDEX "public"."VolunteerApplication_userId_projectId_key";

-- AlterTable
ALTER TABLE "VolunteerApplication" DROP COLUMN "availableStartDate",
DROP COLUMN "coverLetter",
DROP COLUMN "totalHoursWorked",
DROP COLUMN "userId",
ADD COLUMN     "completionNote" TEXT,
ADD COLUMN     "confirmedById" TEXT,
ADD COLUMN     "volunteerId" TEXT NOT NULL,
ADD COLUMN     "workedHours" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "VolunteerProject" DROP COLUMN "duration",
DROP COLUMN "ngoId",
DROP COLUMN "remoteAllowed",
DROP COLUMN "requiredSkills",
DROP COLUMN "status",
DROP COLUMN "timeCommitment",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "_NgoToVolunteerProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NgoToVolunteerProject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_NgoToVolunteerProject_B_index" ON "_NgoToVolunteerProject"("B");

-- AddForeignKey
ALTER TABLE "VolunteerApplication" ADD CONSTRAINT "VolunteerApplication_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerApplication" ADD CONSTRAINT "VolunteerApplication_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NgoToVolunteerProject" ADD CONSTRAINT "_NgoToVolunteerProject_A_fkey" FOREIGN KEY ("A") REFERENCES "ngos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NgoToVolunteerProject" ADD CONSTRAINT "_NgoToVolunteerProject_B_fkey" FOREIGN KEY ("B") REFERENCES "VolunteerProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
