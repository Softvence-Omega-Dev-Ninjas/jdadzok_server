-- CreateTable
CREATE TABLE "public"."community_to_community_follows" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_to_community_follows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "community_to_community_follows_followerId_followingId_key" ON "public"."community_to_community_follows"("followerId", "followingId");

-- AddForeignKey
ALTER TABLE "public"."community_to_community_follows" ADD CONSTRAINT "community_to_community_follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "public"."communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_to_community_follows" ADD CONSTRAINT "community_to_community_follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "public"."communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
