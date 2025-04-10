import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "@/middleware/authMiddleware";

const prisma = new PrismaClient();

export default authenticate(async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search?.toString() || "";

        // Fetch applied jobs with pagination and search
        const appliedJobs = await prisma.applyJob.findMany({
          skip,
          take: limit,
          where: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
          orderBy: { createdAt: "desc" },
        });

        // Extract job IDs from applied jobs
        const jobIds = appliedJobs.map(job => job.jobId).filter(Boolean);

        let jobDetailsMap: Record<string, { id: string; user_id: string; jobTitle: string; companyName: string; companyWebsite: string }> = {};
        let employerInfoMap: Record<string, { id: string; name: string; email: string; phone: string }> = {};

        if (jobIds.length > 0) {
          // Fetch job details
          const jobDetails = await prisma.jobPost.findMany({
            where: { id: { in: jobIds } },
            select: { id: true, user_id: true, jobTitle: true, companyName: true, companyWebsite: true },
          });

          jobDetailsMap = Object.fromEntries(
            jobDetails.map(job => [
              job.id,
              {
                ...job,
                user_id: job.user_id ?? "",
                companyName: job.companyName ?? "",
                companyWebsite: job.companyWebsite ?? "",
              },
            ])
          );

          // Extract unique employer IDs
          const employerIds = jobDetails.map(job => job.user_id).filter((id): id is string => id !== null);

          if (employerIds.length > 0) {
            // Fetch employer details
            const employerInfo = await prisma.user.findMany({
              where: { id: { in: employerIds } },
              select: { id: true, name: true, email: true, phone: true },
            });

            employerInfoMap = Object.fromEntries(
              employerInfo.map(emp => [
                emp.id,
                { ...emp, phone: emp.phone ?? "" }
              ])
            );
          }
        }

        // Attach job details & employer info to applied jobs
        const appliedJobsWithDetails = appliedJobs.map(job => ({
          ...job,
          jobDetails: {
            ...(jobDetailsMap[job.jobId] || {}),
            employer: employerInfoMap[jobDetailsMap[job.jobId]?.user_id] || null,
          },
        }));

        // Total applied jobs count for pagination
        const totalJobs = await prisma.applyJob.count({
          where: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        });

        return res.status(200).json({
          appliedJobs: appliedJobsWithDetails,
          totalPages: Math.ceil(totalJobs / limit),
        });
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
        return res.status(500).json({ message: "Error fetching applied jobs", error });
      }

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
});
