import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "@/middleware/authMiddleware";


const prisma = new PrismaClient();

export default authenticate( async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      try {
        const industries = await prisma.industry.findMany();
        return res.status(200).json(industries);
      } catch (error) {
        return res.status(500).json({ message: "Error fetching job types", error });
      }

    case "POST":
      try {
        const { name, status } = req.body;
        const newIndustrye = await prisma.industry.create({
          data: { name, status },
        });
        return res.status(201).json(newIndustrye);
      } catch (error) {
        return res.status(500).json({ message: "Error creating job type", error });
      }

    case "PUT":
      try {
        const { id, name, status } = req.body;
        const updatedIndustrye = await prisma.industry.update({
          where: { industry_id:id },
          data: { name, status },
        });
        return res.status(200).json(updatedIndustrye);
      } catch (error) {
        return res.status(500).json({ message: "Error updating job type", error });
      }

    case "DELETE":
      try {
        const { id } = req.query;
        await prisma.industry.delete({
          where: { industry_id: id as string },
        });
        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ message: "Error deleting job type", error });
      }

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
});
