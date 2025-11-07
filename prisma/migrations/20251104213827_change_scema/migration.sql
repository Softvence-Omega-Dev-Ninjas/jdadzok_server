/*
  Warnings:

  - A unique constraint covering the columns `[postId]` on the table `DedicatedAd` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[adId]` on the table `DedicatedAd` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DedicatedAd_postId_key" ON "DedicatedAd"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "DedicatedAd_adId_key" ON "DedicatedAd"("adId");
