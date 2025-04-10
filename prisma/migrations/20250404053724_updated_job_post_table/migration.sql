-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "isSaleryHide" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "salaryCurrency" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "officialEmail" TEXT;
