/*
  Warnings:

  - You are about to drop the `call` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- DropForeignKey
ALTER TABLE "public"."call" DROP CONSTRAINT "call_fromId_fkey";

-- DropForeignKey
ALTER TABLE "public"."call" DROP CONSTRAINT "call_toId_fkey";

-- DropTable
DROP TABLE "public"."call";

-- CreateTable
CREATE TABLE "Donations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Donations_userId_idx" ON "Donations"("userId");

-- CreateIndex
CREATE INDEX "Donations_createdAt_idx" ON "Donations"("createdAt");

-- AddForeignKey
ALTER TABLE "Donations" ADD CONSTRAINT "Donations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
