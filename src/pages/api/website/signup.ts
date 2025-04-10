import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "@/lib/cors";


const prisma = new PrismaClient();

interface ExtendedNextApiRequest extends NextApiRequest {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("profile_image");

const userSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(4, "Password must be at least 8 characters long"),
  // phone: z.string().regex(/^\d{10,15}$/, "Phone number must be between 10 and 15 digits").optional(),
  // country: z.string().min(1, "Country is required"),
  // state: z.string().min(1, "State is required"),
  // city: z.string().min(1, "City is required"),
  role: z.enum(["user", "employer"], { message: "Role must be 'user' or 'employer'" }),
  company_name: z.string().optional(),
});

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  await cors(req, res); // Enable CORS for the request
  if (req.method !== "POST") {
    return res.status(405).json({ error: { method: "Method Not Allowed" } });
  }

  // Handle file upload
  upload(req as any, res as any, async (err) => {
    if (err) {
      return res.status(400).json({ error: { profile_image: err.message } });
    }

    const { name, email, password, phone, country, state, city, company_name, role, country_code, is_hiring_manager, managerName, managerEmail, managerPhone, officialEmail } = req.body;
    const profileImagePath = req.file ? `/uploads/${req.file.filename}` : null;

    // **Validate User Data**
    const validation = userSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(422).json({
        error: validation.error.flatten().fieldErrors,
      });
    }

    // **Ensure company_name is required if role is 'employer'**
    if (role === "employer" && !company_name) {
      return res.status(400).json({ error: { company_name: "Company name is required for employers" } });
    }

    try {
      // **Check if Email Already Exists**
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: { email: "Email is already in use" } });
      }

      // **Hash the Password**
      const hashedPassword = await bcrypt.hash(password, 10);

      // **Create User**
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          country,
          state,
          city,
          country_code,
          company_name: role === "employer" ? company_name : null,
          role,
          officialEmail,
          profile_image: profileImagePath,
          is_hiring_manager:is_hiring_manager == "yes", managerName, managerEmail, managerPhone
        },
      });

      return res.status(201).json({
        message: "Signup successful",
        user: { id: newUser.id, email: newUser.email, role: newUser.role, profile_image: newUser.profile_image },
      });
    } catch (error) {
      console.error("Database Error:", error);
      return res.status(500).json({ error: { server: "Error signing up. Please try again later." } });
    }
  });
}