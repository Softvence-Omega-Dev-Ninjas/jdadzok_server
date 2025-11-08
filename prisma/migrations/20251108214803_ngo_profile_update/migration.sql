-- DropIndex
DROP INDEX "ngo_profiles_username_key";

-- AlterTable
ALTER TABLE "ngo_profiles" ALTER COLUMN "username" DROP NOT NULL;
