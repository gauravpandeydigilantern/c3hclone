import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export const authenticate = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const blacklisted = await prisma.blacklistedToken.findUnique({
    where: { token },
  });

  if (blacklisted) {
    return res.status(401).json({ message: "Unauthorized token" });
  }
  

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log(decoded, "api info asd");
    return decoded; // Returns { id, role }
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
