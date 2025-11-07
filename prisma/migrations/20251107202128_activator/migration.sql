/*
  Warnings:

  - You are about to drop the `ActivityScore` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ActivityScore" DROP CONSTRAINT "ActivityScore_userId_fkey";

-- DropTable
DROP TABLE "public"."ActivityScore";

-- CreateTable
CREATE TABLE "activity-score" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "like" DOUBLE PRECISION NOT NULL,
    "comment" DOUBLE PRECISION NOT NULL,
    "share" DOUBLE PRECISION NOT NULL,
    "post" DOUBLE PRECISION NOT NULL,
    "greenCapScore" DOUBLE PRECISION NOT NULL,
    "redCapScore" DOUBLE PRECISION NOT NULL,
    "blackCapScore" DOUBLE PRECISION NOT NULL,
    "yellowCapScore" DOUBLE PRECISION NOT NULL,
    "productSpentPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "productPromotionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity-score_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "activity-score" ADD CONSTRAINT "activity-score_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
