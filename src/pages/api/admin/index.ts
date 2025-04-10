import { NextApiRequest, NextApiResponse } from "next";
import { registerAdmin, fetchAdmins, updateAdmin, removeAdmin } from "@/controllers/adminController";
import { authenticate } from "@/middleware/authMiddleware";

export default authenticate(async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      try {
        const { name, email, password } = req.body;
        const admin = await registerAdmin(name, email, password);
        return res.status(201).json(admin);
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }

    case "GET":
      try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const admins = await fetchAdmins(page, limit);
        return res.status(200).json(admins);
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }

    case "PUT": // ✅ Added edit functionality
      try {
        const { id, name, email, password } = req.body;
        const updatedAdmin = await updateAdmin(id, name, email, password);
        return res.status(200).json(updatedAdmin);
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }

    case "DELETE":
      try {
        const { id } = req.body;
        const deletedAdmin = await removeAdmin(id);
        return res.status(200).json(deletedAdmin);
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
})
