import { NextApiRequest, NextApiResponse } from "next";
import { authenticate } from "@/middleware/authMiddleware";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default authenticate( async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
        const { jobId, isFeatured } = req.body;
        try {
            const updatedJob = await prisma.jobPost.update({
                where: { id: jobId },
                data: { isFeatured: isFeatured === "true" ? true : false },
            });
            return res.status(200).json(updatedJob);
            
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    default:
        return res.status(405).json({ message: "Method Not Allowed" });
    }
}
);
      