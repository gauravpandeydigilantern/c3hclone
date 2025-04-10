-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT true;
