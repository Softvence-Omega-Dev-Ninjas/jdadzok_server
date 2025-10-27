/*
  Warnings:

  - The values [GOVERMENT_ID_OR_PASSPORT,BUSINESS_CERTIFIED_OR_LICENSE] on the enum `IdentityVerificationType` will be removed. If these variants are still used in the database, this will fail.
  - The `documentUrl` column on the `ngo_verifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IdentityVerificationType_new" AS ENUM ('GOVERMENT_AND_PASSPORT', 'BUSINESS_CERTIFIED_AND_LICENSE');
ALTER TABLE "ngo_verifications" ALTER COLUMN "verificationType" TYPE "IdentityVerificationType_new" USING ("verificationType"::text::"IdentityVerificationType_new");
ALTER TYPE "IdentityVerificationType" RENAME TO "IdentityVerificationType_old";
ALTER TYPE "IdentityVerificationType_new" RENAME TO "IdentityVerificationType";
DROP TYPE "public"."IdentityVerificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "file_instances" ALTER COLUMN "filename" DROP NOT NULL,
ALTER COLUMN "originalFilename" DROP NOT NULL,
ALTER COLUMN "path" DROP NOT NULL,
ALTER COLUMN "fileType" DROP NOT NULL,
ALTER COLUMN "mimeType" DROP NOT NULL,
ALTER COLUMN "size" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ngo_verifications" DROP COLUMN "documentUrl",
ADD COLUMN     "documentUrl" TEXT[];
