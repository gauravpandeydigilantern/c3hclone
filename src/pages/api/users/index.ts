import { NextApiRequest, NextApiResponse } from "next";
import { fetchUsers, createUser } from "@/controllers/userController";
import { authenticate } from "@/middleware/authMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
const prisma = new PrismaClient();

// Define upload directory
const uploadDir = path.join(process.cwd(), "public", "uploads", "users", "profile-image");

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Ensure upload directory exists
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
});

// Create a custom middleware to handle multer with Next.js API routes
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// Main API handler
export default authenticate(async function handler(
  req: NextApiRequest & { file?: Express.Multer.File },
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET":
        try {
          const page = Number(req.query.page) || 1;
          const limit = Number(req.query.limit) || 10;
          const search = String(req.query.search || '');
          const type = 'user';
          
          const users = await fetchUsers(page, limit, search, type);
          return res.status(200).json(users);
        } catch (error: any) {
          console.error("Error fetching users:", error);
          return res.status(500).json({ message: error.message || "Failed to fetch users" });
        }
      
      case "POST":
        try {
          // Process file upload
          await runMiddleware(req, res, upload.single('profile_image'));
          
          const { name, email, password, role } = req.body;
          
          // Validate required fields
          if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
          }
          
          // Check email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
          }
          
          // Check if email already exists
          const existingUsers = await prisma.user.findFirst({
            where: { email }
          });
          
          if (existingUsers) {
            return res.status(400).json({ message: "Email already exists" });
          }
          
          // Validate password
          if (password === email) {
            return res.status(400).json({ message: "Password cannot be the same as email" });
          }
          
          if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
          }
          
          // Get profile image path if uploaded
          const profile_image = req.file ? `/uploads/users/profile-image/${req.file.filename}` : req.body.profile_image || null;
          
          // Create user
          const newUser = await createUser({
            name,
            email,
            password,
            role,
            profile_image
          });
          return res.status(201).json(newUser);
        } catch (error: any) {
          console.error("Error creating user:", error);
          return res.status(500).json({ message: error.message || "Failed to create user" });
        }
      
      default:
        return res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Configure Next.js API route to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};