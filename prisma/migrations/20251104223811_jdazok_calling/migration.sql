/*
  Warnings:

  - You are about to drop the `Messenger` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MessengerConversation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Messenger" DROP CONSTRAINT "Messenger_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Messenger" DROP CONSTRAINT "Messenger_fileInstanceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Messenger" DROP CONSTRAINT "Messenger_lastConversationMessageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Messenger" DROP CONSTRAINT "Messenger_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MessengerConversation" DROP CONSTRAINT "MessengerConversation_memberOneId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MessengerConversation" DROP CONSTRAINT "MessengerConversation_memberTwoId_fkey";

-- DropTable
DROP TABLE "public"."Messenger";

-- DropTable
DROP TABLE "public"."MessengerConversation";

-- CreateTable
CREATE TABLE "calls" (
    "id" TEXT NOT NULL,
    "hostUserId" TEXT NOT NULL,
    "status" "CallStatus" NOT NULL DEFAULT 'CALLING',
    "title" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_participants" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "socketId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "hasVideo" BOOLEAN NOT NULL DEFAULT false,
    "hasAudio" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "call_participants_callId_idx" ON "call_participants"("callId");

-- CreateIndex
CREATE INDEX "call_participants_socketId_idx" ON "call_participants"("socketId");

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_participants" ADD CONSTRAINT "call_participants_callId_fkey" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
