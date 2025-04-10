import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get All Services

export const getAllServices = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const services = await prisma.service.findMany({
    skip,
    take: limit,
  });

  const totalAdmins = await prisma.service.count();
  return { services, totalPages: Math.ceil(totalAdmins / limit) };
};
// Get Service by ID
export const getServiceById = async (id: string) => {
  return await prisma.service.findUnique({
    where: { id },
  });
};

// Create Service
export const createService = async (data: any) => {
  try {
    // const { name, image, base_price, work_video, description } = data;
    const { name, image, description } = data;

    if (!name) {
      throw new Error("Name is required field.");
    }

    // const price = parseFloat(base_price);
    // if (isNaN(price) || price <= 0) {
    //   throw new Error("Base price must be a valid positive number.");
    // }

    const newService = await prisma.service.create({
      data: {
        name,
        image,
        description: description || "", // Default to empty string if no description
      },
    });

    return newService;
  } catch (error:any) {
    console.error("Error creating service:", error.message);
    throw new Error(error.message || "Failed to create service");
  }
};

// Update Service
// Update Service Function (Ensure Prisma is imported and configured properly)
export const updateService = async (id: string, data: any) => {
  const { name, image, description } = data;
  return await prisma.service.update({
    where: { id },
    data: {
      name,
      image,
      description: description || "", // Default to empty string if no description
    },
  });
};

// Delete Service
export const deleteService = async (id: string) => {
  return await prisma.service.delete({
    where: { id },
  });
};
