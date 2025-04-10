import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { IncomingForm } from "formidable";
import { z } from "zod";

// Initialize Prisma client
const prisma = new PrismaClient();

// Zod schema for validating fields
const applyJobSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone is required"),
  jobId: z.string().min(1, "Job ID is required"),
});

// Disable Next.js default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const uploadDir = path.join(process.cwd(), "public/uploads/resume");

  // Create upload directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Extract field values
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name || "";
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email || "";
    const phone = Array.isArray(fields.phone) ? fields.phone[0] : fields.phone || "";
    const jobId = Array.isArray(fields.jobId) ? fields.jobId[0] : fields.jobId || "";

    // Validate using Zod
    const validation = applyJobSchema.safeParse({ name, email, phone, jobId });

    if (!validation.success) {
      return res.status(422).json({
        error: validation.error.flatten().fieldErrors,
      });
    }

    const resumeFile = files.resume?.[0] || null;
    const resumeImagePath = resumeFile ? `/uploads/resume/${resumeFile.newFilename}` : null;

    try {
      const newUser = await prisma.applyJob.create({
        data: {
          name,
          email,
          phone,
          jobId,
          resume: resumeImagePath || "",
        },
      });

      return res.status(201).json(newUser);
    } catch (error) {
      console.error("Database Error:", error);
      return res.status(500).json({ error: "Failed to create user" });
    }
  });
}
