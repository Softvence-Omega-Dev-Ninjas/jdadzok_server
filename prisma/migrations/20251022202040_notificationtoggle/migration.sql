/*
  Warnings:

  - You are about to drop the column `scheduling` on the `NotificationToggle` table. All the data in the column will be lost.
  - You are about to drop the column `surveyAndPoll` on the `NotificationToggle` table. All the data in the column will be lost.
  - You are about to drop the column `tasksAndProjects` on the `NotificationToggle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NotificationToggle" DROP COLUMN "scheduling",
DROP COLUMN "surveyAndPoll",
DROP COLUMN "tasksAndProjects",
ADD COLUMN     "comment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "community" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "post" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isToggleNotification" BOOLEAN NOT NULL DEFAULT false;
