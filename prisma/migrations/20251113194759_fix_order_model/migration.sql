/*
  Warnings:

  - You are about to drop the column `stripePaymentId` on the `payments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "payments_stripePaymentId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "stripePaymentId",
ADD COLUMN     "stripeId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT;

-- CreateTable
CREATE TABLE "SellerEarnings" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pending" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastPaidAt" TIMESTAMP(3),

    CONSTRAINT "SellerEarnings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerEarnings_sellerId_key" ON "SellerEarnings"("sellerId");

-- AddForeignKey
ALTER TABLE "SellerEarnings" ADD CONSTRAINT "SellerEarnings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
