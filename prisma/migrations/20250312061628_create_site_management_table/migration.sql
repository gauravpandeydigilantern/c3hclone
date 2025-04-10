-- CreateTable
CREATE TABLE "SiteManagement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "facebook" TEXT NOT NULL,
    "instagram" TEXT NOT NULL,
    "xLink" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "banner" TEXT,
    "phone" TEXT NOT NULL,
    "logo" TEXT,
    "address" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteManagement_pkey" PRIMARY KEY ("id")
);
