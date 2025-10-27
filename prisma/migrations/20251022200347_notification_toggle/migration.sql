-- CreateTable
CREATE TABLE "NotificationToggle" (
    "id" TEXT NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT false,
    "userUpdates" BOOLEAN NOT NULL DEFAULT false,
    "communication" BOOLEAN NOT NULL DEFAULT false,
    "surveyAndPoll" BOOLEAN NOT NULL DEFAULT false,
    "tasksAndProjects" BOOLEAN NOT NULL DEFAULT false,
    "scheduling" BOOLEAN NOT NULL DEFAULT false,
    "message" BOOLEAN NOT NULL DEFAULT false,
    "userRegistration" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "NotificationToggle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationToggle_userId_key" ON "NotificationToggle"("userId");

-- AddForeignKey
ALTER TABLE "NotificationToggle" ADD CONSTRAINT "NotificationToggle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
