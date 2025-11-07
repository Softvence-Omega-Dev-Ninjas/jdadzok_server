/*
  Warnings:

  - You are about to drop the column `processedAt` on the `Withdraw` table. All the data in the column will be lost.
  - You are about to drop the column `stripeId` on the `Withdraw` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Withdraw_userId_idx";

-- AlterTable
ALTER TABLE "Withdraw" DROP COLUMN "processedAt",
DROP COLUMN "stripeId",
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "scheduledFor" TIMESTAMP(3),
ADD COLUMN     "stripeTxnId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
