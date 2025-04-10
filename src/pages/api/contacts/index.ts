import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "@/middleware/authMiddleware";
 
const prisma = new PrismaClient();

export default authenticate(async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const search = req.query.search?.toString() || "";

        const contacts = await prisma.conatct.findMany({
          skip,
          take: limit,
          where: {
            OR: [
              { full_name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { subject: { contains: search, mode: "insensitive" } },
            ],
          },
          orderBy: { createdAt: "desc" },
        });
        const totalAdmins = await prisma.conatct.count({
          where: {
            OR: [
              { full_name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { subject: { contains: search, mode: "insensitive" } },
            ],
          },
        });
        
        return res.status(200).json({ contacts, totalPages: Math.ceil(totalAdmins / limit) });
      } catch (error) {
        return res.status(500).json({ message: "Error fetching contacts", error });
      }

    case "POST":
      try {
        const { full_name, email, subject, message } = req.body;
        const contact = await prisma.conatct.create({
          data: { full_name, email, subject, message },
        });
        return res.status(201).json(contact);
      } catch (error) {
        return res.status(500).json({ message: "Error creating contact", error });
      }

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
});
