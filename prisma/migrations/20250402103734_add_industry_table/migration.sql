-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN     "saveDraft" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Industry" (
    "industry_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("industry_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Industry_name_key" ON "Industry"("name");
