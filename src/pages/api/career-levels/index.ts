import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      try {
        const careerLevels = await prisma.careerLevel.findMany();
        return res.status(200).json(careerLevels);
      } catch (error) {
        return res.status(500).json({ message: "Error fetching career level", error });
      }

    case "POST":
      try {
        const { name, status } = req.body;
        const newCareerLevel = await prisma.careerLevel.create({
          data: { name, status },
        });
        return res.status(201).json(newCareerLevel);
      } catch (error) {
        return res.status(500).json({ message: "Error creating career level", error });
      }

    case "PUT":
      try {
        const { career_level_id, name, status } = req.body;
        const updatedCareerLevel = await prisma.careerLevel.update({
          where: { career_level_id },
          data: { name, status },
        });
        return res.status(200).json(updatedCareerLevel);
      } catch (error) {
        return res.status(500).json({ message: "Error updating career level", error });
      }

    case "DELETE":
      try {
        const { career_level_id } = req.query;
        await prisma.careerLevel.delete({
          where: { career_level_id: career_level_id as string },
        });
        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ message: "Error deleting job skill", error });
      }

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}
