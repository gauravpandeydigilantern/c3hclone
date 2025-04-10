-- CreateTable
CREATE TABLE "SaveCandidateUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "saveCandidateId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaveCandidateUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SaveCandidateUser_userId_saveCandidateId_key" ON "SaveCandidateUser"("userId", "saveCandidateId");
