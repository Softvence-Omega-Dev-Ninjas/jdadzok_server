/*
  Warnings:

  - Added the required column `updatedAt` to the `Donations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Donations" ADD COLUMN     "TransactionId" TEXT,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
