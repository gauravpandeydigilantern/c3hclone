import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import cors from '@/lib/cors';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    // Optionally verify token (to prevent invalid token insert)
    jwt.verify(token, process.env.JWT_SECRET || "wenJHBFWJAKSABHDWJAKSD");

    // Save token to blacklist
    await prisma.blacklistedToken.create({
      data: { token },
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
