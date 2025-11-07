-- AlterTable
ALTER TABLE "ActivityScore" ADD COLUMN     "productPromotionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "productSpentPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
