-- CreateTable
CREATE TABLE "Messenger" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT,
    "lastConversationMessageId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "fileInstanceId" TEXT,

    CONSTRAINT "Messenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessengerConversation" (
    "id" TEXT NOT NULL,
    "memberOneId" TEXT NOT NULL,
    "memberTwoId" TEXT NOT NULL,

    CONSTRAINT "MessengerConversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Messenger_lastConversationMessageId_key" ON "Messenger"("lastConversationMessageId");

-- CreateIndex
CREATE INDEX "MessengerConversation_memberTwoId_idx" ON "MessengerConversation"("memberTwoId");

-- CreateIndex
CREATE UNIQUE INDEX "MessengerConversation_memberOneId_memberTwoId_key" ON "MessengerConversation"("memberOneId", "memberTwoId");

-- AddForeignKey
ALTER TABLE "Messenger" ADD CONSTRAINT "Messenger_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "MessengerConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messenger" ADD CONSTRAINT "Messenger_lastConversationMessageId_fkey" FOREIGN KEY ("lastConversationMessageId") REFERENCES "MessengerConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messenger" ADD CONSTRAINT "Messenger_fileInstanceId_fkey" FOREIGN KEY ("fileInstanceId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messenger" ADD CONSTRAINT "Messenger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessengerConversation" ADD CONSTRAINT "MessengerConversation_memberOneId_fkey" FOREIGN KEY ("memberOneId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessengerConversation" ADD CONSTRAINT "MessengerConversation_memberTwoId_fkey" FOREIGN KEY ("memberTwoId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
