import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      try {
        const qualifications = await prisma.qualification.findMany();
        return res.status(200).json(qualifications);
      } catch (error) {
        return res.status(500).json({ message: "Error fetching job types", error });
      }

    case "POST":
      try {
        const { name, status } = req.body;
        const newQualification = await prisma.qualification.create({
          data: { name, status },
        });
        return res.status(201).json(newQualification);
      } catch (error) {
        return res.status(500).json({ message: "Error creating job type", error });
      }

    case "PUT":
      try {
        const { id, name, status } = req.body;
        const updatedQualification = await prisma.qualification.update({
          where: { id },
          data: { name, status },
        });
        return res.status(200).json(updatedQualification);
      } catch (error) {
        return res.status(500).json({ message: "Error updating job type", error });
      }

    case "DELETE":
      try {
        const { id } = req.query;
        await prisma.qualification.delete({
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
