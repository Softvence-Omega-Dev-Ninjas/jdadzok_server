-- CreateTable
CREATE TABLE "public"."payment-methods" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "cardHolder" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "expireMonth" TEXT NOT NULL,
    "expireYear" TEXT NOT NULL,
    "CVC" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment-methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment-methods_userId_idx" ON "public"."payment-methods"("userId");

-- CreateIndex
CREATE INDEX "payment-methods_method_idx" ON "public"."payment-methods"("method");

-- CreateIndex
CREATE INDEX "payment-methods_createdAt_idx" ON "public"."payment-methods"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."payment-methods" ADD CONSTRAINT "payment-methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
