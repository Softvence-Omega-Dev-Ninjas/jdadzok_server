-- AlterTable
ALTER TABLE "community_profiles" ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "ngo_profiles" ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
