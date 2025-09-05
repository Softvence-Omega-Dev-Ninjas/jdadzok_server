-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."AuthProvider" AS ENUM ('GOOGLE', 'APPLE', 'EMAIL', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "public"."CapLevel" AS ENUM ('NONE', 'GREEN', 'YELLOW', 'RED', 'BLACK', 'OSTRICH_FEATHER');

-- CreateEnum
CREATE TYPE "public"."ChatType" AS ENUM ('DIRECT', 'GROUP');

-- CreateEnum
CREATE TYPE "public"."CommunityRole" AS ENUM ('ADMIN', 'MODERATOR', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."CommunityType" AS ENUM ('PUBLIC', 'PRIVATE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."Feelings" AS ENUM ('HAPPY', 'SAD', 'ANGRY', 'AMAZED', 'AMUSED', 'SCARED', 'PROUD', 'TIRED', 'CONFUSED', 'RELAXED', 'EXCITED', 'WORRIED', 'LOVED', 'GRATEFUL', 'BLESSED', 'HUNGRY', 'HOPEFUL', 'LONELY', 'SILLY', 'THANKFUL', 'AWESOME', 'BORED', 'COOL', 'DETERMINED', 'IN_LOVE', 'INSPIRED', 'MOTIVATED', 'SICK', 'SLEEPY', 'STRESSED', 'STRONG', 'FUNNY', 'MEH');

-- CreateEnum
CREATE TYPE "public"."IdentityVerificationType" AS ENUM ('GOVERMENT_ID_OR_PASSPORT', 'BUSINESS_CERTIFIED_OR_LICENSE');

-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "public"."MembershipStatus" AS ENUM ('PENDING', 'APPROVED', 'BANNED');

-- CreateEnum
CREATE TYPE "public"."MembershipTier" AS ENUM ('SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "public"."MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('LIKE', 'COMMENT', 'FOLLOW', 'SHARE', 'MENTION', 'EARNINGS');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'PAID', 'DELIVERED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."PayOutStatus" AS ENUM ('PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('STRIPE', 'PAYPAL');

-- CreateEnum
CREATE TYPE "public"."PostFrom" AS ENUM ('COMMUNITY', 'NGO', 'REGULAR_PROFILE');

-- CreateEnum
CREATE TYPE "public"."PostVisibility" AS ENUM ('PUBLIC', 'FOLLOWERS', 'PRIVATE');

-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('PENDING', 'REVIEWED');

-- CreateEnum
CREATE TYPE "public"."ReportTargetType" AS ENUM ('POST', 'COMMENT', 'USER');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."VolunteerStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."about" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "location" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "work" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ad_revenue_shares" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "capLevelAtTime" "public"."CapLevel" NOT NULL,
    "sharePercentage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_revenue_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."app_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "issuedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cap_requirements" (
    "id" TEXT NOT NULL,
    "capLevel" "public"."CapLevel" NOT NULL,
    "minActivityScore" DOUBLE PRECISION,
    "minVolunteerHours" INTEGER,
    "requiresVerification" BOOLEAN NOT NULL DEFAULT false,
    "requiresNomination" BOOLEAN NOT NULL DEFAULT false,
    "adSharePercentage" DOUBLE PRECISION NOT NULL,
    "canAccessMarketplace" BOOLEAN NOT NULL DEFAULT false,
    "canAccessVolunteerHub" BOOLEAN NOT NULL DEFAULT false,
    "canReceiveBrandDeals" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cap_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_participants" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chats" (
    "id" TEXT NOT NULL,
    "type" "public"."ChatType" NOT NULL DEFAULT 'DIRECT',
    "name" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."choices" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaType" "public"."MediaType" NOT NULL DEFAULT 'TEXT',
    "parentCommentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."community_memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "role" "public"."CommunityRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."community_about" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "location" TEXT,
    "foundingDate" TIMESTAMP(3),
    "mission" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_about_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."communities" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "foundationDate" TIMESTAMP(3) NOT NULL,
    "communityType" "public"."CommunityType" NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "capLevel" "public"."CapLevel" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."community_profiles" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "coverUrl" TEXT,
    "location" TEXT,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "followingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."corporate_memberships" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "tier" "public"."MembershipTier" NOT NULL DEFAULT 'SILVER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "dailyAdsUsed" INTEGER NOT NULL DEFAULT 0,
    "sponsorshipsUsed" INTEGER NOT NULL DEFAULT 0,
    "contactPersonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."endorsements" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "endorsements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."file_instances" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."follows" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gifs" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gifs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "commentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coordinates" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message_reads" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_reads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT,
    "mediaUrl" TEXT,
    "mediaType" "public"."MediaType",
    "status" "public"."MessageStatus" NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ngo_verifications" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "verificationType" "public"."IdentityVerificationType" NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "status" "public"."VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ngo_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ngo_about" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "location" TEXT,
    "foundingDate" TIMESTAMP(3),
    "mission" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ngo_about_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ngos" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "foundationDate" TIMESTAMP(3) NOT NULL,
    "ngoType" "public"."CommunityType" NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "capLevel" "public"."CapLevel" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ngos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ngo_profiles" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "coverUrl" TEXT,
    "location" TEXT,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "followingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ngo_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entityId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "shippingAddress" TEXT,
    "trackingNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payouts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "status" "public"."PayOutStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "processorFee" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_metrics" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "totalLikes" INTEGER NOT NULL DEFAULT 0,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "totalShares" INTEGER NOT NULL DEFAULT 0,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "revenueGenerated" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_tag_users" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_tag_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_metadata" (
    "id" TEXT NOT NULL,
    "feelings" "public"."Feelings" NOT NULL DEFAULT 'HAPPY',
    "checkInId" TEXT,
    "gifId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."posts" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaType" "public"."MediaType" NOT NULL DEFAULT 'TEXT',
    "visibility" "public"."PostVisibility" NOT NULL DEFAULT 'PUBLIC',
    "postFrom" "public"."PostFrom" NOT NULL DEFAULT 'REGULAR_PROFILE',
    "categoryId" TEXT,
    "communityId" TEXT,
    "ngoId" TEXT,
    "metadataId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."marketplace_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "location" TEXT,
    "availability" INTEGER NOT NULL DEFAULT 1,
    "digitalFileUrl" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "coverUrl" TEXT,
    "location" TEXT,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "followingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" "public"."ReportTargetType" NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shares" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "monthlyFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trending_topics" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "mentions" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trending_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_choices" (
    "userId" TEXT NOT NULL,
    "choiceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_choices_pkey" PRIMARY KEY ("userId","choiceId")
);

-- CreateTable
CREATE TABLE "public"."user_metrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalPosts" INTEGER NOT NULL DEFAULT 0,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "totalLikes" INTEGER NOT NULL DEFAULT 0,
    "totalShares" INTEGER NOT NULL DEFAULT 0,
    "totalFollowers" INTEGER NOT NULL DEFAULT 0,
    "totalFollowing" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "currentMonthEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "volunteerHours" INTEGER NOT NULL DEFAULT 0,
    "completedProjects" INTEGER NOT NULL DEFAULT 0,
    "activityScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "authProvider" "public"."AuthProvider" NOT NULL DEFAULT 'EMAIL',
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "capLevel" "public"."CapLevel" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."volunteer_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "coverLetter" TEXT,
    "availableStartDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."volunteer_projects" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "remoteAllowed" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."VolunteerStatus" NOT NULL DEFAULT 'OPEN',
    "requiredSkills" TEXT,
    "timeCommitment" TEXT,
    "duration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wishlists" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_CommunityLikers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CommunityLikers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_NgoFollowers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NgoFollowers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_NgoLikers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NgoLikers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "about_userId_key" ON "public"."about"("userId");

-- CreateIndex
CREATE INDEX "ad_revenue_shares_userId_idx" ON "public"."ad_revenue_shares"("userId");

-- CreateIndex
CREATE INDEX "ad_revenue_shares_year_month_idx" ON "public"."ad_revenue_shares"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "ad_revenue_shares_userId_month_year_key" ON "public"."ad_revenue_shares"("userId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "app_settings_key_key" ON "public"."app_settings"("key");

-- CreateIndex
CREATE INDEX "bans_userId_idx" ON "public"."bans"("userId");

-- CreateIndex
CREATE INDEX "bans_isActive_idx" ON "public"."bans"("isActive");

-- CreateIndex
CREATE INDEX "bans_expiresAt_idx" ON "public"."bans"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "cap_requirements_capLevel_key" ON "public"."cap_requirements"("capLevel");

-- CreateIndex
CREATE INDEX "chat_participants_chatId_idx" ON "public"."chat_participants"("chatId");

-- CreateIndex
CREATE INDEX "chat_participants_userId_idx" ON "public"."chat_participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_participants_chatId_userId_key" ON "public"."chat_participants"("chatId", "userId");

-- CreateIndex
CREATE INDEX "chats_createdById_idx" ON "public"."chats"("createdById");

-- CreateIndex
CREATE INDEX "chats_type_idx" ON "public"."chats"("type");

-- CreateIndex
CREATE UNIQUE INDEX "choices_text_key" ON "public"."choices"("text");

-- CreateIndex
CREATE UNIQUE INDEX "choices_slug_key" ON "public"."choices"("slug");

-- CreateIndex
CREATE INDEX "choices_slug_idx" ON "public"."choices"("slug");

-- CreateIndex
CREATE INDEX "choices_category_idx" ON "public"."choices"("category");

-- CreateIndex
CREATE INDEX "comments_postId_idx" ON "public"."comments"("postId");

-- CreateIndex
CREATE INDEX "comments_authorId_idx" ON "public"."comments"("authorId");

-- CreateIndex
CREATE INDEX "comments_parentCommentId_idx" ON "public"."comments"("parentCommentId");

-- CreateIndex
CREATE INDEX "comments_createdAt_idx" ON "public"."comments"("createdAt");

-- CreateIndex
CREATE INDEX "community_memberships_userId_idx" ON "public"."community_memberships"("userId");

-- CreateIndex
CREATE INDEX "community_memberships_communityId_idx" ON "public"."community_memberships"("communityId");

-- CreateIndex
CREATE UNIQUE INDEX "community_memberships_userId_communityId_key" ON "public"."community_memberships"("userId", "communityId");

-- CreateIndex
CREATE UNIQUE INDEX "community_about_communityId_key" ON "public"."community_about"("communityId");

-- CreateIndex
CREATE INDEX "communities_ownerId_idx" ON "public"."communities"("ownerId");

-- CreateIndex
CREATE INDEX "communities_communityType_idx" ON "public"."communities"("communityType");

-- CreateIndex
CREATE INDEX "communities_capLevel_idx" ON "public"."communities"("capLevel");

-- CreateIndex
CREATE INDEX "communities_isVerified_idx" ON "public"."communities"("isVerified");

-- CreateIndex
CREATE UNIQUE INDEX "community_profiles_communityId_key" ON "public"."community_profiles"("communityId");

-- CreateIndex
CREATE UNIQUE INDEX "community_profiles_username_key" ON "public"."community_profiles"("username");

-- CreateIndex
CREATE INDEX "community_profiles_username_idx" ON "public"."community_profiles"("username");

-- CreateIndex
CREATE UNIQUE INDEX "corporate_memberships_contactEmail_key" ON "public"."corporate_memberships"("contactEmail");

-- CreateIndex
CREATE INDEX "corporate_memberships_tier_idx" ON "public"."corporate_memberships"("tier");

-- CreateIndex
CREATE INDEX "corporate_memberships_isActive_idx" ON "public"."corporate_memberships"("isActive");

-- CreateIndex
CREATE INDEX "corporate_memberships_contactEmail_idx" ON "public"."corporate_memberships"("contactEmail");

-- CreateIndex
CREATE INDEX "endorsements_fromUserId_idx" ON "public"."endorsements"("fromUserId");

-- CreateIndex
CREATE INDEX "endorsements_toUserId_idx" ON "public"."endorsements"("toUserId");

-- CreateIndex
CREATE INDEX "endorsements_projectId_idx" ON "public"."endorsements"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "file_instances_url_key" ON "public"."file_instances"("url");

-- CreateIndex
CREATE INDEX "file_instances_uploadedById_idx" ON "public"."file_instances"("uploadedById");

-- CreateIndex
CREATE INDEX "file_instances_fileType_idx" ON "public"."file_instances"("fileType");

-- CreateIndex
CREATE INDEX "file_instances_createdAt_idx" ON "public"."file_instances"("createdAt");

-- CreateIndex
CREATE INDEX "follows_followerId_idx" ON "public"."follows"("followerId");

-- CreateIndex
CREATE INDEX "follows_followingId_idx" ON "public"."follows"("followingId");

-- CreateIndex
CREATE INDEX "follows_createdAt_idx" ON "public"."follows"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "follows_followerId_followingId_key" ON "public"."follows"("followerId", "followingId");

-- CreateIndex
CREATE UNIQUE INDEX "gifs_url_key" ON "public"."gifs"("url");

-- CreateIndex
CREATE INDEX "likes_userId_idx" ON "public"."likes"("userId");

-- CreateIndex
CREATE INDEX "likes_postId_idx" ON "public"."likes"("postId");

-- CreateIndex
CREATE INDEX "likes_commentId_idx" ON "public"."likes"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "likes_userId_postId_commentId_key" ON "public"."likes"("userId", "postId", "commentId");

-- CreateIndex
CREATE INDEX "locations_name_idx" ON "public"."locations"("name");

-- CreateIndex
CREATE INDEX "message_reads_messageId_idx" ON "public"."message_reads"("messageId");

-- CreateIndex
CREATE INDEX "message_reads_userId_idx" ON "public"."message_reads"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "message_reads_messageId_userId_key" ON "public"."message_reads"("messageId", "userId");

-- CreateIndex
CREATE INDEX "messages_chatId_idx" ON "public"."messages"("chatId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "public"."messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "public"."messages"("createdAt");

-- CreateIndex
CREATE INDEX "ngo_verifications_ngoId_idx" ON "public"."ngo_verifications"("ngoId");

-- CreateIndex
CREATE INDEX "ngo_verifications_status_idx" ON "public"."ngo_verifications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ngo_about_ngoId_key" ON "public"."ngo_about"("ngoId");

-- CreateIndex
CREATE INDEX "ngos_ownerId_idx" ON "public"."ngos"("ownerId");

-- CreateIndex
CREATE INDEX "ngos_ngoType_idx" ON "public"."ngos"("ngoType");

-- CreateIndex
CREATE INDEX "ngos_isVerified_idx" ON "public"."ngos"("isVerified");

-- CreateIndex
CREATE UNIQUE INDEX "ngo_profiles_ngoId_key" ON "public"."ngo_profiles"("ngoId");

-- CreateIndex
CREATE UNIQUE INDEX "ngo_profiles_username_key" ON "public"."ngo_profiles"("username");

-- CreateIndex
CREATE INDEX "ngo_profiles_username_idx" ON "public"."ngo_profiles"("username");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "public"."notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "public"."notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_read_idx" ON "public"."notifications"("read");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "public"."notifications"("createdAt");

-- CreateIndex
CREATE INDEX "orders_buyerId_idx" ON "public"."orders"("buyerId");

-- CreateIndex
CREATE INDEX "orders_productId_idx" ON "public"."orders"("productId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "public"."orders"("status");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "public"."orders"("createdAt");

-- CreateIndex
CREATE INDEX "payouts_userId_idx" ON "public"."payouts"("userId");

-- CreateIndex
CREATE INDEX "payouts_status_idx" ON "public"."payouts"("status");

-- CreateIndex
CREATE INDEX "payouts_createdAt_idx" ON "public"."payouts"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "post_metrics_postId_key" ON "public"."post_metrics"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "post_tag_users_postId_userId_key" ON "public"."post_tag_users"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "post_category_name_key" ON "public"."post_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "post_category_slug_key" ON "public"."post_category"("slug");

-- CreateIndex
CREATE INDEX "post_category_slug_idx" ON "public"."post_category"("slug");

-- CreateIndex
CREATE INDEX "post_category_order_idx" ON "public"."post_category"("order");

-- CreateIndex
CREATE INDEX "posts_authorId_idx" ON "public"."posts"("authorId");

-- CreateIndex
CREATE INDEX "posts_createdAt_idx" ON "public"."posts"("createdAt");

-- CreateIndex
CREATE INDEX "posts_communityId_idx" ON "public"."posts"("communityId");

-- CreateIndex
CREATE INDEX "posts_ngoId_idx" ON "public"."posts"("ngoId");

-- CreateIndex
CREATE INDEX "posts_visibility_idx" ON "public"."posts"("visibility");

-- CreateIndex
CREATE INDEX "posts_categoryId_idx" ON "public"."posts"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_categories_name_key" ON "public"."marketplace_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_categories_slug_key" ON "public"."marketplace_categories"("slug");

-- CreateIndex
CREATE INDEX "marketplace_categories_slug_idx" ON "public"."marketplace_categories"("slug");

-- CreateIndex
CREATE INDEX "products_sellerId_idx" ON "public"."products"("sellerId");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "public"."products"("categoryId");

-- CreateIndex
CREATE INDEX "products_isVisible_idx" ON "public"."products"("isVisible");

-- CreateIndex
CREATE INDEX "products_price_idx" ON "public"."products"("price");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "public"."profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "public"."profiles"("username");

-- CreateIndex
CREATE INDEX "profiles_username_idx" ON "public"."profiles"("username");

-- CreateIndex
CREATE INDEX "profiles_name_idx" ON "public"."profiles"("name");

-- CreateIndex
CREATE INDEX "reports_reporterId_idx" ON "public"."reports"("reporterId");

-- CreateIndex
CREATE INDEX "reports_targetType_targetId_idx" ON "public"."reports"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "public"."reports"("status");

-- CreateIndex
CREATE INDEX "shares_userId_idx" ON "public"."shares"("userId");

-- CreateIndex
CREATE INDEX "shares_postId_idx" ON "public"."shares"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "shares_userId_postId_key" ON "public"."shares"("userId", "postId");

-- CreateIndex
CREATE INDEX "subscriptions_subscriberId_idx" ON "public"."subscriptions"("subscriberId");

-- CreateIndex
CREATE INDEX "subscriptions_creatorId_idx" ON "public"."subscriptions"("creatorId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "public"."subscriptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_subscriberId_creatorId_key" ON "public"."subscriptions"("subscriberId", "creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "trending_topics_keyword_key" ON "public"."trending_topics"("keyword");

-- CreateIndex
CREATE INDEX "trending_topics_score_idx" ON "public"."trending_topics"("score");

-- CreateIndex
CREATE INDEX "trending_topics_startDate_endDate_idx" ON "public"."trending_topics"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "trending_topics_keyword_idx" ON "public"."trending_topics"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "user_metrics_userId_key" ON "public"."user_metrics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_capLevel_idx" ON "public"."users"("capLevel");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "public"."users"("createdAt");

-- CreateIndex
CREATE INDEX "volunteer_applications_userId_idx" ON "public"."volunteer_applications"("userId");

-- CreateIndex
CREATE INDEX "volunteer_applications_projectId_idx" ON "public"."volunteer_applications"("projectId");

-- CreateIndex
CREATE INDEX "volunteer_applications_status_idx" ON "public"."volunteer_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_applications_userId_projectId_key" ON "public"."volunteer_applications"("userId", "projectId");

-- CreateIndex
CREATE INDEX "volunteer_projects_createdById_idx" ON "public"."volunteer_projects"("createdById");

-- CreateIndex
CREATE INDEX "volunteer_projects_status_idx" ON "public"."volunteer_projects"("status");

-- CreateIndex
CREATE INDEX "volunteer_projects_remoteAllowed_idx" ON "public"."volunteer_projects"("remoteAllowed");

-- CreateIndex
CREATE INDEX "wishlists_userId_idx" ON "public"."wishlists"("userId");

-- CreateIndex
CREATE INDEX "wishlists_productId_idx" ON "public"."wishlists"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_productId_userId_key" ON "public"."wishlists"("productId", "userId");

-- CreateIndex
CREATE INDEX "_CommunityLikers_B_index" ON "public"."_CommunityLikers"("B");

-- CreateIndex
CREATE INDEX "_NgoFollowers_B_index" ON "public"."_NgoFollowers"("B");

-- CreateIndex
CREATE INDEX "_NgoLikers_B_index" ON "public"."_NgoLikers"("B");

-- AddForeignKey
ALTER TABLE "public"."about" ADD CONSTRAINT "about_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ad_revenue_shares" ADD CONSTRAINT "ad_revenue_shares_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bans" ADD CONSTRAINT "bans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bans" ADD CONSTRAINT "bans_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_participants" ADD CONSTRAINT "chat_participants_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_participants" ADD CONSTRAINT "chat_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chats" ADD CONSTRAINT "chats_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "public"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_memberships" ADD CONSTRAINT "community_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_memberships" ADD CONSTRAINT "community_memberships_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_about" ADD CONSTRAINT "community_about_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."communities" ADD CONSTRAINT "communities_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_profiles" ADD CONSTRAINT "community_profiles_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."corporate_memberships" ADD CONSTRAINT "corporate_memberships_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."endorsements" ADD CONSTRAINT "endorsements_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."endorsements" ADD CONSTRAINT "endorsements_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."endorsements" ADD CONSTRAINT "endorsements_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."volunteer_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_instances" ADD CONSTRAINT "file_instances_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."follows" ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."follows" ADD CONSTRAINT "follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_reads" ADD CONSTRAINT "message_reads_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_reads" ADD CONSTRAINT "message_reads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ngo_verifications" ADD CONSTRAINT "ngo_verifications_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "public"."ngos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ngo_verifications" ADD CONSTRAINT "ngo_verifications_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ngo_about" ADD CONSTRAINT "ngo_about_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "public"."ngos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ngos" ADD CONSTRAINT "ngos_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ngo_profiles" ADD CONSTRAINT "ngo_profiles_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "public"."ngos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payouts" ADD CONSTRAINT "payouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_metrics" ADD CONSTRAINT "post_metrics_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_tag_users" ADD CONSTRAINT "post_tag_users_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_tag_users" ADD CONSTRAINT "post_tag_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_metadata" ADD CONSTRAINT "post_metadata_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "public"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_metadata" ADD CONSTRAINT "post_metadata_gifId_fkey" FOREIGN KEY ("gifId") REFERENCES "public"."gifs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."post_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "public"."ngos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "public"."post_metadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."marketplace_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shares" ADD CONSTRAINT "shares_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shares" ADD CONSTRAINT "shares_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trending_topics" ADD CONSTRAINT "trending_topics_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."post_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_choices" ADD CONSTRAINT "user_choices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_choices" ADD CONSTRAINT "user_choices_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "public"."choices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_metrics" ADD CONSTRAINT "user_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."volunteer_applications" ADD CONSTRAINT "volunteer_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."volunteer_applications" ADD CONSTRAINT "volunteer_applications_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."volunteer_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."volunteer_projects" ADD CONSTRAINT "volunteer_projects_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wishlists" ADD CONSTRAINT "wishlists_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wishlists" ADD CONSTRAINT "wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CommunityLikers" ADD CONSTRAINT "_CommunityLikers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CommunityLikers" ADD CONSTRAINT "_CommunityLikers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_NgoFollowers" ADD CONSTRAINT "_NgoFollowers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."ngos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_NgoFollowers" ADD CONSTRAINT "_NgoFollowers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_NgoLikers" ADD CONSTRAINT "_NgoLikers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."ngos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_NgoLikers" ADD CONSTRAINT "_NgoLikers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
