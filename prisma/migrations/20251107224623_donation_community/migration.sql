-- AlterEnum
ALTER TYPE "DonationStatus" ADD VALUE 'CANCELED';

-- AlterTable
ALTER TABLE "Donations" ADD COLUMN     "communityId" TEXT;

-- CreateIndex
CREATE INDEX "Donations_communityId_idx" ON "Donations"("communityId");

-- AddForeignKey
ALTER TABLE "Donations" ADD CONSTRAINT "Donations_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
