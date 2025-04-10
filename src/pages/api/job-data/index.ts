import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import cors from "@/lib/cors";
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  if (req.method !== "GET") return res.status(405).json({ message: "Method Not Allowed" });
  try {
    const [jobSkills, jobTypes, jobCategories, careerLevels, qualifications, tags] = await Promise.all([
      prisma.jobSkill.findMany({ where: { status: true }, select: {id:true, name:true} }),
      prisma.jobType.findMany({ where: { status: true } , select: {id:true, name:true} }),
      prisma.jobCategory.findMany({ where: { status: true } , select: {id:true, name:true} }),
      prisma.careerLevel.findMany({ where: { status: true } , select: {career_level_id:true, name:true} }),
      prisma.qualification.findMany({ where: { status: true } , select: {id:true, name:true} }),
      prisma.tag.findMany({ where: { status: true } , select: {tag_id:true, name:true} }),
    ]);

    return res.status(200).json({
      jobSkills,
      jobTypes,
      jobCategories,
      careerLevels,
      qualifications,
      tags,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
}
