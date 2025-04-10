import { NextApiRequest, NextApiResponse } from "next";
import { fetchUsers, createUser } from "@/controllers/userController";
import { authenticate } from "@/middleware/authMiddleware";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default authenticate( async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
       try {
          const page = Number(req.query.page) || 1;
          const limit = Number(req.query.limit) || 5;
          const search = req.query.search || '';
          const type = 'employer';
          const users = await fetchUsers(page, limit, search, type);
          return res.status(200).json(users);
        } catch (error: any) {
          return res.status(500).json({ message: error.message });
        }
    case "POST":
      const {
        name,
        email,
        password,
        role,
        profile_image,
        country_code,
        phone,
        country,
        state,
        city,
        company_name,
        is_hiring_manager,
        officialEmail,
        managerName,
        managerEmail,
        managerPhone,
        companyWebsite,
        companySize,
        Industry,
        founded,
        location,
        billingCountry,
        billingState,
        billingCity,
        billingZipcode,
        billingAddress,
        billingApartmentSuite,
        isFeatured,
        status
      } = req.body;

      const employerData = {
        name,
        email,
        password,
        role: "employer",
        profile_image,
        country_code,
        phone,
        country,
        state,
        city,
        company_name,
        is_hiring_manager,
        officialEmail,
        managerName,
        managerEmail,
        managerPhone,
        companyWebsite,
        companySize,
        Industry,
        founded,
        location,
        billingCountry,
        billingState,
        billingCity,
        billingZipcode,
        billingAddress,
        billingApartmentSuite,
        isFeatured,
        status
      };
      try {
        const user = await createUser(employerData);
        return res.status(201).json(user);
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
});
