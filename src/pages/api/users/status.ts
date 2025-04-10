import { NextApiRequest, NextApiResponse } from "next";
import { updateUserStatus } from "@/controllers/userController";
import { authenticate } from "@/middleware/authMiddleware";

export default authenticate( async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
        const { userId, status } = req.body;
        try {
            const updatedUser = await updateUserStatus(userId, status);
            return res.status(200).json(updatedUser);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
});
