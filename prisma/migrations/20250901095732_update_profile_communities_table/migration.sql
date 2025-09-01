-- AlterTable
ALTER TABLE "public"."communityMembership" ADD COLUMN     "sharedProfileId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."communityMembership" ADD CONSTRAINT "communityMembership_sharedProfileId_fkey" FOREIGN KEY ("sharedProfileId") REFERENCES "public"."sharedProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
