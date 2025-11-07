-- CreateEnum
CREATE TYPE "Status" AS ENUM ('CONTINUED', 'SOLDOUT', 'DISCONTINUED');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'CONTINUED';
