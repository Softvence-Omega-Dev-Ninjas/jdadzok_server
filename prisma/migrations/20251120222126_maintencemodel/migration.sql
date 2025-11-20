-- CreateTable
CREATE TABLE "PlatformInformation" (
    "id" TEXT NOT NULL,
    "platformName" TEXT,
    "supportEmail" TEXT,
    "platformUrl" TEXT,

    CONSTRAINT "PlatformInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceModel" (
    "id" TEXT NOT NULL,
    "maxEventsPerCommunity" INTEGER,
    "MaxPostPerDay" INTEGER,

    CONSTRAINT "MaintenanceModel_pkey" PRIMARY KEY ("id")
);
