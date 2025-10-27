/*
  Warnings:

  - You are about to drop the column `documentUrl` on the `ngo_verifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ngo_verifications" DROP COLUMN "documentUrl",
ADD COLUMN     "documents" TEXT[];
