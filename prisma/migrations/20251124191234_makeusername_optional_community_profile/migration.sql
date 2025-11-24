-- DropIndex
DROP INDEX "community_profiles_username_key";

-- AlterTable
ALTER TABLE "community_profiles" ALTER COLUMN "username" DROP NOT NULL;
