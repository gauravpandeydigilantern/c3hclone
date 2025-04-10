import { NextApiRequest, NextApiResponse } from "next";
import { getPackageById, updatePackage, deletePackage } from "@/controllers/packageController";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const packageData = await getPackageById(id as string);
      if (!packageData) return res.status(404).json({ message: "Package not found" });
      return res.status(200).json(packageData);
    }

    if (req.method === "PUT") {
      const { package_name, description, max_job_posts, is_premium, max_portfolio, price } = req.body;

      const updatedPackage = await updatePackage(id as string, {
        package_name,
        description,
        max_job_posts: Number(max_job_posts),
        is_premium: Boolean(is_premium),
        max_portfolio: Number(max_portfolio),
        price: parseFloat(price),
      });

      return res.status(200).json({ message: "Package updated", updatedPackage });
    }

    if (req.method === "DELETE") {
      await deletePackage(id as string);
      return res.status(204).send("");
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
}
