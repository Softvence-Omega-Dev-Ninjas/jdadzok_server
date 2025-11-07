/*
  Warnings:

  - Added the required column `blackCapScore` to the `ActivityScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `greenCapScore` to the `ActivityScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `redCapScore` to the `ActivityScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yellowCapScore` to the `ActivityScore` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActivityScore" ADD COLUMN     "blackCapScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "greenCapScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "redCapScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "yellowCapScore" DOUBLE PRECISION NOT NULL;
