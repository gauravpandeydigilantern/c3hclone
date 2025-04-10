import { NextApiRequest, NextApiResponse } from "next";
import { getUserById, updateUser, deleteUser } from "@/controllers/userController";
import { authenticate } from "@/middleware/authMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser for file uploads
  },
};



export default authenticate(async function handler(req: NextApiRequest & { file?: Express.Multer.File }, res: NextApiResponse) {
  const { id } = req.query;
  
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
  
  try {
    switch (req.method) {
      case "GET":
        return res.json(await getUserById(id as string));
      case "PUT":
        // Process file upload first
        await runMiddleware(req, res, upload.single('profile_image'));
        
        const { name, email, password, phone } = req.body;
        
        // Validate required fields
        if (!name || !email ) {
          return res.status(400).json({ message: "Name, email, and role are required" });
        }
        
        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ message: "Invalid email format" });
        }
        
        // Check if email already exists for other users (not the current one being updated)
        const existingUser = await prisma.user.findFirst({
          where: { 
            email,
            id: { not: id as string }
          }
        });
        
        if (existingUser) {
          return res.status(400).json({ message: "Email already exists" });
        }
        
        // Password validation (only if provided)
        if (password) {
          if (password === email) {
            return res.status(400).json({ message: "Password cannot be the same as email" });
          }
          
          if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
          }
        }
        
        // Get profile image path if uploaded
        const profile_image = req.file ? `/uploads/users/profile-image/${req.file.filename}` : req.body.profile_image || undefined;
        
        // Update user
        return res.json(await updateUser(id as string, {name, email, password, phone, profile_image}));
      
      case "DELETE":
        return res.json(await deleteUser(id as string));
      
      default:
        return res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error:any) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});