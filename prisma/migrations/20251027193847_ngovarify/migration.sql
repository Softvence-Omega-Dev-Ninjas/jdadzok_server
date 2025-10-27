/*
  Warnings:

  - The values [GOVERMENT_ID_OR_PASSPORT,BUSINESS_CERTIFIED_OR_LICENSE] on the enum `IdentityVerificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `verifyDocumentType` on the `ngo_verifications` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IdentityVerificationType_new" AS ENUM ('GOVERMENT_ID_AND_PASSPORT', 'BUSINESS_CERTIFIED_AND_LICENSE');
ALTER TABLE "ngo_verifications" ALTER COLUMN "verificationType" TYPE "IdentityVerificationType_new" USING ("verificationType"::text::"IdentityVerificationType_new");
ALTER TYPE "IdentityVerificationType" RENAME TO "IdentityVerificationType_old";
ALTER TYPE "IdentityVerificationType_new" RENAME TO "IdentityVerificationType";
DROP TYPE "public"."IdentityVerificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "ngo_verifications" DROP COLUMN "verifyDocumentType";

-- DropEnum
DROP TYPE "public"."VerifyDocumentType";
