-- CreateTable
CREATE TABLE "public"."Posts" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "media_url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);
