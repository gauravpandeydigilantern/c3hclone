import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

const upload = multer({ dest: "public/uploads/icons/" });

export const config = { api: { bodyParser: false } };

interface NextApiRequestWithFiles extends NextApiRequest {
  file: any;
}

export default async function handler(req: NextApiRequestWithFiles, res: NextApiResponse) {
  switch (req.method) {
      case "GET":
        try {
          const page = Number(req.query.page) || 1;
          const limit = Number(req.query.limit) || 5;
          const skip = (page - 1) * limit;
          const search = req.query.search?.toString() || "";
  
          const jobCategories = await prisma.jobCategory.findMany({
            skip,
            take: limit,
            where: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            },
            orderBy: { createdAt: "desc" },
          });
          const totaljobCategories = await prisma.jobCategory.count({
            where: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            },
          });
          
          return res.status(200).json({ jobCategories, totalPages: Math.ceil(totaljobCategories / limit) });
        } catch (error) {
          return res.status(500).json({ message: "Error fetching contacts", error });
        }
    case "POST":
      upload.single("icon")(req as any, res as any, async (err: any) => {
      if (err) return res.status(500).json({ message: "File upload error", error: err });

      const { name, parent_id, description } = req.body;
      let iconImage: any = null;

      if (req.file) {
        const extension = path.extname(req.file.originalname);
        const newFileName = `${req.file.filename}${extension}`;
        const newFilePath = path.join("public/uploads/icons", newFileName);
        fs.renameSync(req.file.path, newFilePath);
        iconImage = `/uploads/icons/${newFileName}`;
      }

      try {
        const newJobCategory = await prisma.jobCategory.create({
        data: { name, icon: iconImage, parent_id, description },
        });
        return res.status(201).json(newJobCategory);
      } catch (error) {
        return res.status(500).json({ message: "Error creating job category", error });
      }
      });
      break;

    case "PUT":
      upload.single("icon")(req as any, res as any, async (err: any) => {
      if (err) return res.status(500).json({ message: "File upload error", error: err });

      const { id, name, parent_id, description } = req.body;
      let iconImage: any = null;

      if (req.file) {
        const extension = path.extname(req.file.originalname);
        const newFileName = `${req.file.filename}${extension}`;
        const newFilePath = path.join("public/uploads/icons", newFileName);
        fs.renameSync(req.file.path, newFilePath);
        iconImage = `/uploads/icons/${newFileName}`;
      }

      try {
        // If no new image is uploaded, retain the old one
        const existingCategory = await prisma.jobCategory.findUnique({ where: { id } });
        if (!iconImage) iconImage = existingCategory?.icon;

        const updatedJobCategory = await prisma.jobCategory.update({
        where: { id },
        data: { name, icon: iconImage, parent_id, description },
        });
        return res.status(200).json(updatedJobCategory);
      } catch (error) {
        return res.status(500).json({ message: "Error updating job category", error });
      }
      });
      break;

    case "DELETE":
      try {
        const { id } = req.query;
        const category = await prisma.jobCategory.findUnique({ where: { id: id as string } });

        if (category?.icon) {
          const filePath = path.join(process.cwd(), "public", category.icon);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await prisma.jobCategory.delete({ where: { id: id as string } });
        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ message: "Error deleting job category", error });
      }

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}
