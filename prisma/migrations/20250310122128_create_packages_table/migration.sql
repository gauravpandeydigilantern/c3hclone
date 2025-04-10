-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "package_name" TEXT NOT NULL,
    "description" TEXT,
    "max_job_posts" INTEGER NOT NULL,
    "is_premium" BOOLEAN NOT NULL,
    "max_portfolio" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);
