import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getAdminByEmail } from "@/models/adminModel";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  const { email, password } = req.body;
  const admin = await getAdminByEmail(email);

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });

  res.status(200).json({ token });
}
