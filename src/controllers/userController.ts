import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { console } from "inspector";

const prisma = new PrismaClient();


export const fetchUsers = async (page: number, limit: number, search: any, type: string) => {
  
  const skip = (page - 1) * limit;
  const users = await prisma.user.findMany({
    skip,
    take: limit,
    where: {
      AND: [
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
        {
          role: type,
        },
      ],
    },
  });

  const totalUsers = await prisma.user.count({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
        {
          role: type,
        },
      ],
    },
  });

  return { users, totalPages: Math.ceil(totalUsers / limit) };
};


export const createUser = async (data: any) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const userData = {
    ...data,
    password: hashedPassword,
  };
  return await prisma.user.create({ data: userData });
}

export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({ where: { id } });
};

export const updateUser = async (id: string, data: any) => {
  return await prisma.user.update({ where: { id }, data });
};

export const updateUserStatus = async (id: string, status: string) => {
  return await prisma.user.update({
    where: { id },
    data: { status: status === "true" ? true : false },
  });
}

export const deleteUser = async (id: string) => {
  return await prisma.user.delete({ where: { id } });
};
