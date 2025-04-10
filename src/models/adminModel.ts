import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createAdmin = async (name: string, email: string, password: string) => {
  return await prisma.admin.create({
    data: { name, email, password },
  });
};

export const getAdminByEmail = async (email: string) => {
  return await prisma.admin.findUnique({ where: { email } });
};

export const getAllAdmins = async () => {
  return await prisma.admin.findMany();
};

export const deleteAdmin = async (id: string) => {
  return await prisma.admin.delete({ where: { id } });
};
