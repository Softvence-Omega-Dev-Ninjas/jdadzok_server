-- AlterTable
ALTER TABLE "notification-toggle" ALTER COLUMN "email" SET DEFAULT false,
ALTER COLUMN "userUpdates" SET DEFAULT false,
ALTER COLUMN "communication" SET DEFAULT false,
ALTER COLUMN "community" SET DEFAULT false,
ALTER COLUMN "comment" SET DEFAULT false,
ALTER COLUMN "post" SET DEFAULT false,
ALTER COLUMN "message" SET DEFAULT false,
ALTER COLUMN "userRegistration" SET DEFAULT false,
ALTER COLUMN "ngo" SET DEFAULT false;
