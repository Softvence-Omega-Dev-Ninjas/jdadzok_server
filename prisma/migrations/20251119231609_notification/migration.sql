/*
  Warnings:

  - The values [VOLUNTEER_MATCH,SYSTEM,CAP_UPGRADE,LIKE,COMMENT,FOLLOW,SHARE,MENTION,EARNINGS] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('Community', 'Comment', 'UserRegistration', 'PostEvent', 'Ngo');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;
