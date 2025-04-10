import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get All Packages
export const getAllPackages = async () => {
  return await prisma.package.findMany();
};

// Get Package by ID
export const getPackageById = async (id: string) => {
  return await prisma.package.findUnique({
    where: { id },
  });
};

// Create Package
export const createPackage = async (data: any) => {
  return await prisma.package.create({ data });
};

// Update Package
export const updatePackage = async (id: string, data: any) => {
  return await prisma.package.update({
    where: { id },
    data,
  });
};

// Delete Package
export const deletePackage = async (id: string) => {
  return await prisma.package.delete({
    where: { id },
  });
};
