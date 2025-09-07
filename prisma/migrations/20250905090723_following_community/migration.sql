-- CreateTable
CREATE TABLE "public"."community_followers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_followers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "community_followers_userId_communityId_key" ON "public"."community_followers"("userId", "communityId");

-- AddForeignKey
ALTER TABLE "public"."community_followers" ADD CONSTRAINT "community_followers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_followers" ADD CONSTRAINT "community_followers_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
