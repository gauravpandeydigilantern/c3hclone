import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get All Testimonials
export const getAllTestimonials = async () => {
  return await prisma.testimonial.findMany();
};

// Get Single Testimonial
export const getTestimonialById = async (id: string) => {
  return await prisma.testimonial.findUnique({ where: { id } });
};

// Create Testimonial
export const createTestimonial = async (name: string, position: string, description: string, image: string) => {
  return await prisma.testimonial.create({
    data: { name, position, description, image },
  });
};

// Update Testimonial
export const updateTestimonial = async (id: string, data: { name?: string; position?: string; description?: string; image?: string }) => {
  return await prisma.testimonial.update({ where: { id }, data });
};

// Delete Testimonial
export const deleteTestimonial = async (id: string) => {
  return await prisma.testimonial.delete({ where: { id } });
};
