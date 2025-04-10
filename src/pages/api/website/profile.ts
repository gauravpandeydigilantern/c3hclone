import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "@/middleware/authApimiddleare";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Authenticate the user using the middleware
  const decoded:any = await authenticate(req, res);  // Await the result from authenticate
  
  if (!decoded) {
    return; // If authentication fails, stop the process
  }

  const userId = decoded.id;  // The decoded JWT should now contain the user ID
  console.log(userId, "userId");

  try {
    let user;
    if (decoded.role === "user") {
      user = await prisma.user.findUnique({
        select: { 
          name: true, 
          email: true,  
          country: true, 
          state: true, 
          city: true, 
          phone: true, 
          country_code: true
        },
        where: { id: decoded.id },
      });
    } else {
      user = await prisma.user.findUnique({
        select: { 
          name: true, 
          email: true,  
          country: true, 
          state: true, 
          city: true, 
          company_name: true,  
          phone: true, 
          country_code: true 
        },
        where: { id: decoded.id },
      });
    }

    // If the user is not found, return a 404 response
    if (!user) return res.status(404).json({ message: "User not found" });

    // Return the user data with a 200 status
    return res.status(200).json(user);
  } catch (error) {
    // Handle any errors and return a 500 response
    console.error(error);
    return res.status(500).json({ message: "Error fetching profile", error });
  }
}
