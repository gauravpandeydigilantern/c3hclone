// job categoies
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import cors from "@/lib/cors";
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Enable CORS for this route
    await cors(req, res);
    switch (req.method) {
        case "GET":
            try {
                const jobCategories = await prisma.jobCategory.findMany({
                    where: { status: true },
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                    },
                });

                const result = await Promise.all(
                    jobCategories.map(async (category) => {
                        const jobCount = await prisma.jobPost.count({
                            where: {
                                jobCategories: {
                                    has: category.id,
                                },
                            },
                        });
                        return {
                            id: category.id,
                            name: category.name,
                            icon: category.icon,
                            jobCount,
                        };
                    })
                );

                return res.status(200).json(result);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Error fetching job categories" });
            }
        default:
            return res.status(405).json({ message: "Method not allowed" });
    }
}