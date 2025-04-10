import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // 🔹 Fetch testimonials
    const testimonials = await prisma.testimonial.findMany({
      where: { status: true },
      select: {
        id: true,
        name: true,
        position: true,
        description: true,
        image: true,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    // 🔹 Site management data
    const sitemanagement = await prisma.siteManagement.findFirst({
      select: {
        id: true,
        logo: true,
        name: true,
        description: true,
        email: true,
        banner: true,
      },
    });

    // 🔹 Pagination setup
    const page = 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    const search = req.query.search?.toString() || "";

    // 🔹 Fetch recent jobs with basic fields
    const jobs = await prisma.jobPost.findMany({
      skip,
      take: limit,
      where: {
        OR: [
          { companyName: { contains: search, mode: "insensitive" } },
          { jobTitle: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        jobTitle: true,
        country: true,
        state: true,
        city: true,
        user_id: true,
        location: true,
      },
    });

    if (jobs.length === 0) {
      return res.status(200).json({
        testimonials,
        sitemanagement,
        jobs: [],
      });
    }

    // 🔹 Get unique employer IDs and fetch employers
    const employerIds = jobs.map(job => job.user_id).filter(id => id !== null);

    const employers = await prisma.user.findMany({
      where: { id: { in: employerIds } },
      select: { id: true, name: true, profile_image: true },
    });

    // 🔹 Map job with selected employer info
    const jobsWithSelectedData = jobs.map(job => {
      const employer = employers.find(emp => emp.id === job.user_id);
      return {
        id: job.id,
        jobTitle: job.jobTitle,
        country: job.country,
        state: job.state,
        city: job.city,
        location: job.location,
        employer: {
          name: employer?.name || null,
          profile_image: employer?.profile_image || null,
        },
      };
    });

    // 🔹 Final Response
    return res.status(200).json({
      testimonials,
      sitemanagement,
      jobs: jobsWithSelectedData,
    });

  } catch (error) {
    console.error("Homepage API error:", error);
    return res.status(500).json({ error: "Failed to fetch homepage data" });
  }
}
