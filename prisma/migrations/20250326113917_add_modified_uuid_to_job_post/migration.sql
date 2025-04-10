/*
  Warnings:

  - The primary key for the `JobPost` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "JobPost" DROP CONSTRAINT "JobPost_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "JobPost_id_seq";
