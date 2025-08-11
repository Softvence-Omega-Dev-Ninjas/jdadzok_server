-- AlterTable
ALTER TABLE "Survey" ADD COLUMN     "isForAll" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "surveyType" SET DEFAULT 'EmployeeSatisfaction';
