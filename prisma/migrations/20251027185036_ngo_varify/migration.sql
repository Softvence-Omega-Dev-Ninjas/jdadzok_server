/*
  Warnings:

  - Added the required column `verifyDocumentType` to the `ngo_verifications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VerifyDocumentType" AS ENUM ('GOVERNMENT_DOCUMENT', 'BUSINESS_CERTIFICATE');

-- AlterTable
ALTER TABLE "ngo_verifications" ADD COLUMN     "verifyDocumentType" "VerifyDocumentType" NOT NULL;
