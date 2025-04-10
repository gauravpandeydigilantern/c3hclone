import { NextApiRequest, NextApiResponse } from "next";
import { getUserById, updateUser, deleteUser } from "@/controllers/userController";
import { authenticate } from "@/middleware/authMiddleware";
export default authenticate( async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  switch (req.method) {
    case "GET":
      return res.json(await getUserById(id as string));
    case "PUT":
      return res.json(await updateUser(id as string, req.body));
    case "DELETE":
      return res.json(await deleteUser(id as string));
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
});
