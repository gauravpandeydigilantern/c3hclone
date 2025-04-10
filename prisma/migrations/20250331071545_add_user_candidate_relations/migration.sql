-- AddForeignKey
ALTER TABLE "SaveCandidateUser" ADD CONSTRAINT "SaveCandidateUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaveCandidateUser" ADD CONSTRAINT "SaveCandidateUser_saveCandidateId_fkey" FOREIGN KEY ("saveCandidateId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
