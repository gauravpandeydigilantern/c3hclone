-- CreateTable
CREATE TABLE "CareerLevel" (
    "career_level_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerLevel_pkey" PRIMARY KEY ("career_level_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CareerLevel_name_key" ON "CareerLevel"("name");
