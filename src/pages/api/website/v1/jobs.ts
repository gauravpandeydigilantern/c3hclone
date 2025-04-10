import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import cors from "@/lib/cors";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS for this route
  await cors(req, res);
  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    const search = req.query.search?.toString() || "";
    const dateFilter = req.query.createdAt?.toString() || 'all';

    // Parse multiple filters (comma-separated values)
    const jobCategoryFilter = req.query.jobCategory ? req.query.jobCategory.toString().split(',').map(String) : [];
    const jobSkillFilter = req.query.jobSkill ? req.query.jobSkill.toString().split(',').map(String) : [];
    const jobTypeFilter = req.query.jobType ? req.query.jobType.toString().split(',').map(String) : [];
    const careerLevelFilter = req.query.careerLevel ? String(req.query.careerLevel) : null;
    // const industryFilter = req.query.industry ? String(req.query.industry) : null;

    // Determine the date filter
    let createdAtFilter = {};
    if (dateFilter === 'last24Hours') {
      createdAtFilter = {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        },
      };
    } else if (dateFilter === 'lastWeek') {
      createdAtFilter = {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
      };
    } else if (dateFilter === 'lastMonth') {
      createdAtFilter = {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      };
    }

    // Fetch jobs with pagination and filtering (including multiple filters)
    const jobs = await prisma.jobPost.findMany({
      skip,
      take: limit,
      where: {
        AND: [
          {
            OR: [
              { companyName: { contains: search, mode: "insensitive" } },
              { jobTitle: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
            ],
          },
          // Add the filter conditions here:
          {
            saveDraft: false,
            status: true,
           },
          jobCategoryFilter.length ? { jobCategories: { hasSome: jobCategoryFilter } } : {},
          jobSkillFilter.length ? { jobSkills: { hasSome: jobSkillFilter } } : {},
          jobTypeFilter.length ? { jobType: { in: jobTypeFilter } } : {},
          careerLevelFilter ? { careerLevels: { has: careerLevelFilter } } : {},
          // industryFilter ? { industry: industryFilter } : {},
          createdAtFilter,  // Add the date filter here
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    if (jobs.length === 0) {
      return res.status(200).json({
        jobs: [],
        totalPages: 0,
        currentPage: page,
        totalJobs: 0,
      });
    }

    const jobIds = jobs.map(job => job.id);

    // 🔹 Fetch related data using your custom method
    const jobCategories = await prisma.jobCategory.findMany({
      where: { id: { in: jobs.flatMap(job => job.jobCategories || []) } },
      select: { id: true, name: true },
    });

    const jobTypes = await prisma.jobType.findMany({
      where: { id: { in: jobs.map(job => job.jobType).filter((type): type is string => type !== null) } },
      select: { id: true, name: true },
    });

    const jobSkills = await prisma.jobSkill.findMany({
      where: { id: { in: jobs.flatMap(job => job.jobSkills || []) } },
      select: { id: true, name: true },
    });

    const qualifications = await prisma.qualification.findMany({
      where: { id: { in: jobs.flatMap(job => job.qualifications || []) } },
      select: { id: true, name: true },
    });

    const careerLevels = await prisma.careerLevel.findMany({
      where: { career_level_id: { in: jobs.flatMap(job => job.careerLevels || []) } },
      select: { career_level_id: true, name: true },
    });

    const employerIds = jobs.map(job => job.user_id).filter(id => id !== null);

    const employers = await prisma.user.findMany({
      where: { id: { in: employerIds } },
      select: { id: true, name: true, profile_image: true, phone: true },
    });

    // 🔹 Map related data into jobs
    const jobsWithRelations = jobs.map(job => ({
      ...job,
      jobCategories: jobCategories.filter(cat => job.jobCategories?.includes(cat.id)),
      jobType: jobTypes.find(type => type.id === job.jobType) || null,
      jobSkills: jobSkills.filter(skill => job.jobSkills?.includes(skill.id)),
      qualifications: qualifications.filter(qual => job.qualifications?.includes(qual.id)),
      careerLevels: careerLevels.filter(level => job.careerLevels?.includes(level.career_level_id)),
      employer: employers.find(emp => emp.id === job.user_id) || null,
    }));

    // Get total count for pagination
    const totalJobs = await prisma.jobPost.count({
      where: {
        AND: [
          {
            OR: [
              { companyName: { contains: search, mode: "insensitive" } },
              { jobTitle: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
            ],
          },
          jobCategoryFilter.length ? { jobCategories: { hasSome: jobCategoryFilter } } : {},
          jobSkillFilter.length ? { jobSkills: { hasSome: jobSkillFilter } } : {},
          jobTypeFilter.length ? { jobType: { in: jobTypeFilter } } : {},
          careerLevelFilter ? { careerLevels: { has: careerLevelFilter } } : {},
          // industryFilter ? { industry: industryFilter } : {},
          createdAtFilter,  // Add the date filter here
        ],
      },
    });

    return res.status(200).json({
      jobs: jobsWithRelations,
      totalPages: Math.ceil(totalJobs / limit),
      currentPage: page,
      totalJobs,
    });
  } catch (error) {
    console.error("Job postings fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch job postings" });
  }
}
