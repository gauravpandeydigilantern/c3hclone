import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from '@/lib/cors';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "wenJHBFWJAKSABHDWJAKSD"; // Store in .env

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  const { email, password, role } = req.body;

  if (!email || !password || !role) return res.status(400).json({ message: "Missing required fields" });

  try {
    let user;
    if (role === "user") {
      user = await prisma.user.findUnique({ where: { email } });
    } else if (role === "employer") {
      user = await prisma.user.findUnique({ where: { email } });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!user) return res.status(404).json({ message: "User not found" });
    if(!user.status) return res.status(403).json({ message: "Account is inactive" });
    if (user.role !== role) return res.status(403).json({ message: "Unauthorized role" });
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role }, SECRET_KEY, { expiresIn: "1d" });

    return res.status(200).json({ message: "Login successful", token, user: { id: user.id, email: user.email, role: user.role, profile_image: user.profile_image, name:user.name } });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in", error });
  }
}
