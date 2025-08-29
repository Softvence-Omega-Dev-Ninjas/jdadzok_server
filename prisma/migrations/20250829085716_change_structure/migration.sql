/*
  Warnings:

  - You are about to drop the `Choice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Follow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Gif` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostMetadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostTagUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `about` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `adRevenueShare` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_participants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `endorsements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `file_instance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `likes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message_reads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payout` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shares` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `volunteer_applications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `volunteer_projects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Choice" DROP CONSTRAINT "Choice_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Follow" DROP CONSTRAINT "Follow_followerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Follow" DROP CONSTRAINT "Follow_followingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PostMetadata" DROP CONSTRAINT "PostMetadata_checkInId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PostMetadata" DROP CONSTRAINT "PostMetadata_gifId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PostTagUser" DROP CONSTRAINT "PostTagUser_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PostTagUser" DROP CONSTRAINT "PostTagUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."about" DROP CONSTRAINT "about_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."adRevenueShare" DROP CONSTRAINT "adRevenueShare_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."bans" DROP CONSTRAINT "bans_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chat_participants" DROP CONSTRAINT "chat_participants_chatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chat_participants" DROP CONSTRAINT "chat_participants_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chats" DROP CONSTRAINT "chats_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_parentCommentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."endorsements" DROP CONSTRAINT "endorsements_fromUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."endorsements" DROP CONSTRAINT "endorsements_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."endorsements" DROP CONSTRAINT "endorsements_toUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."likes" DROP CONSTRAINT "likes_commentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."likes" DROP CONSTRAINT "likes_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."likes" DROP CONSTRAINT "likes_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."message_reads" DROP CONSTRAINT "message_reads_messageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."message_reads" DROP CONSTRAINT "message_reads_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_chatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_buyerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."payout" DROP CONSTRAINT "payout_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."posts" DROP CONSTRAINT "posts_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."posts" DROP CONSTRAINT "posts_metadataId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."reports" DROP CONSTRAINT "reports_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."shares" DROP CONSTRAINT "shares_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."shares" DROP CONSTRAINT "shares_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscription" DROP CONSTRAINT "subscription_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscription" DROP CONSTRAINT "subscription_subscriberId_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteer_applications" DROP CONSTRAINT "volunteer_applications_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteer_applications" DROP CONSTRAINT "volunteer_applications_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteer_projects" DROP CONSTRAINT "volunteer_projects_createdById_fkey";

-- DropTable
DROP TABLE "public"."Choice";

-- DropTable
DROP TABLE "public"."Follow";

-- DropTable
DROP TABLE "public"."Gif";

-- DropTable
DROP TABLE "public"."Location";

-- DropTable
DROP TABLE "public"."Notification";

-- DropTable
DROP TABLE "public"."PostMetadata";

-- DropTable
DROP TABLE "public"."PostTagUser";

-- DropTable
DROP TABLE "public"."Product";

-- DropTable
DROP TABLE "public"."about";

-- DropTable
DROP TABLE "public"."adRevenueShare";

-- DropTable
DROP TABLE "public"."bans";

-- DropTable
DROP TABLE "public"."categories";

-- DropTable
DROP TABLE "public"."chat_participants";

-- DropTable
DROP TABLE "public"."chats";

-- DropTable
DROP TABLE "public"."comments";

-- DropTable
DROP TABLE "public"."endorsements";

-- DropTable
DROP TABLE "public"."file_instance";

-- DropTable
DROP TABLE "public"."likes";

-- DropTable
DROP TABLE "public"."message_reads";

-- DropTable
DROP TABLE "public"."messages";

-- DropTable
DROP TABLE "public"."orders";

-- DropTable
DROP TABLE "public"."payout";

-- DropTable
DROP TABLE "public"."posts";

-- DropTable
DROP TABLE "public"."profiles";

-- DropTable
DROP TABLE "public"."reports";

-- DropTable
DROP TABLE "public"."shares";

-- DropTable
DROP TABLE "public"."subscription";

-- DropTable
DROP TABLE "public"."users";

-- DropTable
DROP TABLE "public"."volunteer_applications";

-- DropTable
DROP TABLE "public"."volunteer_projects";

-- DropEnum
DROP TYPE "public"."ApplicationStatus";

-- DropEnum
DROP TYPE "public"."AuthProvider";

-- DropEnum
DROP TYPE "public"."CapLevel";

-- DropEnum
DROP TYPE "public"."ChatType";

-- DropEnum
DROP TYPE "public"."Feelings";

-- DropEnum
DROP TYPE "public"."MediaType";

-- DropEnum
DROP TYPE "public"."MessageStatus";

-- DropEnum
DROP TYPE "public"."NotificationType";

-- DropEnum
DROP TYPE "public"."OrderStatus";

-- DropEnum
DROP TYPE "public"."PayOutStatus";

-- DropEnum
DROP TYPE "public"."PaymentMethod";

-- DropEnum
DROP TYPE "public"."PostVisibility";

-- DropEnum
DROP TYPE "public"."ReportStatus";

-- DropEnum
DROP TYPE "public"."ReportTargetType";

-- DropEnum
DROP TYPE "public"."Role";

-- DropEnum
DROP TYPE "public"."SubscriptionStatus";

-- DropEnum
DROP TYPE "public"."VolunteerStatus";
