-- CreateTable
CREATE TABLE "BookPurchase" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookPurchase_stripeSessionId_key" ON "BookPurchase"("stripeSessionId");

-- CreateIndex
CREATE INDEX "BookPurchase_email_idx" ON "BookPurchase"("email");
