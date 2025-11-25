/*
  Warnings:

  - You are about to drop the `Donations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Donations" DROP CONSTRAINT "Donations_communityId_fkey";

-- DropForeignKey
ALTER TABLE "Donations" DROP CONSTRAINT "Donations_userId_fkey";

-- DropTable
DROP TABLE "Donations";

-- DropEnum
DROP TYPE "DonationStatus";

-- CreateTable
CREATE TABLE "DonationLog" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "ngoOwnerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "stripeTxFrom" TEXT NOT NULL,
    "stripeTxTo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DonationLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DonationLog" ADD CONSTRAINT "DonationLog_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationLog" ADD CONSTRAINT "DonationLog_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "ngos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationLog" ADD CONSTRAINT "DonationLog_ngoOwnerId_fkey" FOREIGN KEY ("ngoOwnerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
