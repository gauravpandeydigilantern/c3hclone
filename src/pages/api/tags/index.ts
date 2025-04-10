import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      try {
        const tags = await prisma.tag.findMany();
        return res.status(200).json(tags);
      } catch (error) {
        return res.status(500).json({ message: "Error fetching job skills", error });
      }

    case "POST":
      try {
        const { name, status } = req.body;
        const newtag = await prisma.tag.create({
          data: { name, status },
        });
        return res.status(201).json(newtag);
      } catch (error) {
        return res.status(500).json({ message: "Error creating job skill", error });
      }

    case "PUT":
      try {
        const { tag_id, name, status } = req.body;
        const updatedtag = await prisma.tag.update({
          where: { tag_id },
          data: { name, status },
        });
        return res.status(200).json(updatedtag);
      } catch (error) {
        return res.status(500).json({ message: "Error updating job skill", error });
      }

    case "DELETE":
      try {
        const { tag_id } = req.query;
        await prisma.tag.delete({
          where: { tag_id: tag_id as string },
        });
        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ message: "Error deleting job skill", error });
      }

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}
