-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('FIXED_PRICE', 'PER_HOUR', 'REMOTE', 'PER_SESSION', 'FREELANCE');

-- CreateTable
CREATE TABLE "ServicePost" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "serviceTitle" VARCHAR(100) NOT NULL,
    "serviceCategory" VARCHAR(50) NOT NULL,
    "serviceLocation" VARCHAR(100) NOT NULL,
    "expertiseDesc" TEXT NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "aboutService" TEXT NOT NULL,
    "thumbnailImages" TEXT,
    "videoUrl" TEXT,
    "mediaImages" TEXT,
    "pricingType" "PricingType",
    "startingPrice" DECIMAL(10,2),
    "priceCurrency" VARCHAR(6) DEFAULT 'USD',
    "pricingDescription" TEXT,
    "highlights" JSONB,
    "keywords" JSONB,
    "faq" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ServicePost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServicePost_serviceCategory_idx" ON "ServicePost"("serviceCategory");

-- CreateIndex
CREATE INDEX "ServicePost_serviceLocation_idx" ON "ServicePost"("serviceLocation");

-- CreateIndex
CREATE INDEX "ServicePost_serviceTitle_idx" ON "ServicePost"("serviceTitle");
