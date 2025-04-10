import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      try {
        const jobSkills = await prisma.jobSkill.findMany();
        return res.status(200).json(jobSkills);
      } catch (error) {
        return res.status(500).json({ message: "Error fetching job skills", error });
      }

    case "POST":
      try {
        const { name, status } = req.body;
        const newJobSkill = await prisma.jobSkill.create({
          data: { name, status },
        });
        return res.status(201).json(newJobSkill);
      } catch (error) {
        return res.status(500).json({ message: "Error creating job skill", error });
      }

    case "PUT":
      try {
        const { id, name, status } = req.body;
        const updatedJobSkill = await prisma.jobSkill.update({
          where: { id },
          data: { name, status },
        });
        return res.status(200).json(updatedJobSkill);
      } catch (error) {
        return res.status(500).json({ message: "Error updating job skill", error });
      }

    case "DELETE":
      try {
        const { id } = req.query;
        await prisma.jobSkill.delete({
          where: { id: id as string },
        });
        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ message: "Error deleting job skill", error });
      }

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}
