/*
  Warnings:

  - The primary key for the `SaveCandidateUser` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "SaveCandidateUser" DROP CONSTRAINT "SaveCandidateUser_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "saveCandidateId" SET DATA TYPE TEXT,
ADD CONSTRAINT "SaveCandidateUser_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SaveCandidateUser_id_seq";
