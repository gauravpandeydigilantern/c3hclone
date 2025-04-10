import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  switch (req.method) {
    case "GET":
      try {
        const industries = await prisma.industry.findMany({
            where: { status: true },
            select: {
                industry_id: true,
                name: true,
            },
        });
        return res.status(200).json(industries);
      } catch (error) {
        return res.status(500).json({ message: "Error fetching job types", error });
      }
    }
}
