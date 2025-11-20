-- CreateTable
CREATE TABLE "FinancialSettings" (
    "id" TEXT NOT NULL,
    "platformCOmmission" INTEGER,
    "MinimumPayoutAmount" INTEGER,
    "currency" TEXT,
    "stripeApiKey" TEXT,
    "autoApprovePayouts" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FinancialSettings_pkey" PRIMARY KEY ("id")
);
