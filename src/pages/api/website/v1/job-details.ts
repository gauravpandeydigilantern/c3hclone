import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import cors from "@/lib/cors";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS for this route
  await cors(req, res);
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
  console.log("Received job details request:", req.body);
  const { jobId } = req.body;

  if (!jobId) {
    return res.status(400).json({ error: "Job ID is required" });
  }

  try {
    // Fetch job details
    const job = await prisma.jobPost.findUnique({
      where: { id: String(jobId) },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Fetch related data manually
    const jobCategories = await prisma.jobCategory.findMany({
      where: { id: { in: job.jobCategories } },
      select: { id: true, name: true },
    });

    const qualifications = await prisma.qualification.findMany({
      where: { id: { in: job.qualifications } },
      select: { id: true, name: true },
    });

    const careerLevels = await prisma.careerLevel.findMany({
      where: { career_level_id: { in: job.careerLevels } },
      select: { career_level_id: true, name: true },
    });

    const jobTypeData = job.jobType
      ? await prisma.jobType.findUnique({
          where: { id: job.jobType },
          select: { name: true },
        })
      : null;
    const jobType = jobTypeData?.name;
    
    const tags = await prisma.tag.findMany({
        where: { tag_id: { in: job.tags } },
        select: { tag_id: true, name: true },
      });

    const jobSkills = await prisma.jobSkill.findMany({
      where: { id: { in: job.jobSkills } },
      select: { id: true, name: true },
    });

    res.status(200).json({
      ...job,
      jobCategories,
      qualifications,
      careerLevels,
      jobSkills,
      tags,
      jobType
    });
  } catch (error) {
    console.error("Error fetching job details:", error);
    res.status(500).json({ error: "Failed to fetch job details" });
  }
}
