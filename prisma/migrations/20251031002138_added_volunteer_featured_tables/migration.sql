/*
  Warnings:

  - You are about to drop the `volunteer_applications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `volunteer_projects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."endorsements" DROP CONSTRAINT "endorsements_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteer_applications" DROP CONSTRAINT "volunteer_applications_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteer_applications" DROP CONSTRAINT "volunteer_applications_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteer_projects" DROP CONSTRAINT "volunteer_projects_createdById_fkey";

-- DropTable
DROP TABLE "public"."volunteer_applications";

-- DropTable
DROP TABLE "public"."volunteer_projects";

-- CreateTable
CREATE TABLE "VolunteerApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "coverLetter" TEXT,
    "availableStartDate" TIMESTAMP(3),
    "totalHoursWorked" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerCompletion" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "ngoConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmationNote" TEXT,
    "confirmedById" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerHour" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "loggedByUserId" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerProject" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "remoteAllowed" BOOLEAN NOT NULL DEFAULT false,
    "requiredSkills" TEXT,
    "timeCommitment" TEXT,
    "duration" TEXT,
    "status" "VolunteerStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerApplication_userId_projectId_key" ON "VolunteerApplication"("userId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerCompletion_applicationId_key" ON "VolunteerCompletion"("applicationId");

-- AddForeignKey
ALTER TABLE "endorsements" ADD CONSTRAINT "endorsements_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "VolunteerProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerApplication" ADD CONSTRAINT "VolunteerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerApplication" ADD CONSTRAINT "VolunteerApplication_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "VolunteerProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerCompletion" ADD CONSTRAINT "VolunteerCompletion_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "VolunteerApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerCompletion" ADD CONSTRAINT "VolunteerCompletion_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerHour" ADD CONSTRAINT "VolunteerHour_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "VolunteerApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerHour" ADD CONSTRAINT "VolunteerHour_loggedByUserId_fkey" FOREIGN KEY ("loggedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerProject" ADD CONSTRAINT "VolunteerProject_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "ngos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerProject" ADD CONSTRAINT "VolunteerProject_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
