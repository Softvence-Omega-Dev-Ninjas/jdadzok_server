-- CreateTable
CREATE TABLE "ActivityScore" (
    "id" TEXT NOT NULL,
    "like" DOUBLE PRECISION NOT NULL,
    "comment" DOUBLE PRECISION NOT NULL,
    "share" DOUBLE PRECISION NOT NULL,
    "post" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ActivityScore_pkey" PRIMARY KEY ("id")
);
