-- CreateTable
CREATE TABLE "JobCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "parent_id" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobCategory_parent_id_idx" ON "JobCategory"("parent_id");

-- AddForeignKey
ALTER TABLE "JobCategory" ADD CONSTRAINT "JobCategory_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "JobCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
