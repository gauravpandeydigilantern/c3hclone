import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      try {
        const jobTypes = await prisma.jobType.findMany();
        return res.status(200).json(jobTypes);
      } catch (error) {
        return res.status(500).json({ message: "Error fetching job types", error });
      }

    case "POST":
      try {
        const { name, status } = req.body;
        const newJobType = await prisma.jobType.create({
          data: { name, status },
        });
        return res.status(201).json(newJobType);
      } catch (error) {
        return res.status(500).json({ message: "Error creating job type", error });
      }

    case "PUT":
      try {
        const { id, name, status } = req.body;
        const updatedJobType = await prisma.jobType.update({
          where: { id },
          data: { name, status },
        });
        return res.status(200).json(updatedJobType);
      } catch (error) {
        return res.status(500).json({ message: "Error updating job type", error });
      }

    case "DELETE":
      try {
        const { id } = req.query;
        await prisma.jobType.delete({
          where: { id: id as string },
        });
        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ message: "Error deleting job type", error });
      }

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}
