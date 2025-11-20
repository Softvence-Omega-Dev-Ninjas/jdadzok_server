-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'VOLUNTEER_MATCH';
ALTER TYPE "NotificationType" ADD VALUE 'SYSTEM';
ALTER TYPE "NotificationType" ADD VALUE 'CAP_UPGRADE';
ALTER TYPE "NotificationType" ADD VALUE 'LIKE';
ALTER TYPE "NotificationType" ADD VALUE 'COMMENT';
ALTER TYPE "NotificationType" ADD VALUE 'FOLLOW';
ALTER TYPE "NotificationType" ADD VALUE 'SHARE';
ALTER TYPE "NotificationType" ADD VALUE 'MENTION';
ALTER TYPE "NotificationType" ADD VALUE 'EARNINGS';
