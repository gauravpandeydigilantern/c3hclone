import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Fetch Admins with Pagination
export const fetchAdmins = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const admins = await prisma.admin.findMany({
    skip,
    take: limit,
  });

  const totalAdmins = await prisma.admin.count();
  return { admins, totalPages: Math.ceil(totalAdmins / limit) };
};

// Register a new admin
export const registerAdmin = async (name: string, email: string, password: string) => {
   const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.admin.create({
    data: { name, email, password:hashedPassword },
  });
};

// Update Admin ✅
export const updateAdmin = async (id: string, name: string, email: string, password?: string) => {
  return await prisma.admin.update({
    where: { id },
    data: { name, email, ...(password && { password }) }, // Only update password if provided
  });
};

// Remove Admin
export const removeAdmin = async (id: string) => {
  return await prisma.admin.delete({
    where: { id },
  });
};
