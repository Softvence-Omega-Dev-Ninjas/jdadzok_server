-- AlterTable
ALTER TABLE "public"."posts" ADD COLUMN     "acceptDonation" BOOLEAN DEFAULT false,
ADD COLUMN     "acceptVolunteer" BOOLEAN DEFAULT false;
