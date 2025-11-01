-- AlterTable
ALTER TABLE "notification-toggle" ALTER COLUMN "email" SET DEFAULT true,
ALTER COLUMN "userUpdates" SET DEFAULT true,
ALTER COLUMN "communication" SET DEFAULT true,
ALTER COLUMN "message" SET DEFAULT true,
ALTER COLUMN "userRegistration" SET DEFAULT true;
