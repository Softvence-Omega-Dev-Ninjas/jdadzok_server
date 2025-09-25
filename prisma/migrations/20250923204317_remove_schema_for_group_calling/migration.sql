/*
  Warnings:

  - You are about to drop the column `creatorId` on the `call` table. All the data in the column will be lost.
  - You are about to drop the `Participant` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fromId` to the `call` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toId` to the `call` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Participant" DROP CONSTRAINT "Participant_callId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Participant" DROP CONSTRAINT "Participant_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."call" DROP CONSTRAINT "call_creatorId_fkey";

-- DropIndex
DROP INDEX "public"."call_creatorId_idx";

-- AlterTable
ALTER TABLE "public"."call" DROP COLUMN "creatorId",
ADD COLUMN     "fromId" TEXT NOT NULL,
ADD COLUMN     "toId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Participant";

-- CreateIndex
CREATE INDEX "call_fromId_idx" ON "public"."call"("fromId");

-- CreateIndex
CREATE INDEX "call_toId_idx" ON "public"."call"("toId");

-- AddForeignKey
ALTER TABLE "public"."call" ADD CONSTRAINT "call_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."call" ADD CONSTRAINT "call_toId_fkey" FOREIGN KEY ("toId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
