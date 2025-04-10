import { NextApiRequest, NextApiResponse } from "next";
import { getAllPackages, createPackage } from "@/controllers/packageController";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const packages = await getAllPackages();
      return res.status(200).json(packages);
    }

    if (req.method === "POST") {
      const { package_name, description, max_job_posts, is_premium, max_portfolio, price } = req.body;

      if (!package_name || max_job_posts == null || is_premium == null || max_portfolio == null || price == null) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newPackage = await createPackage({
        package_name,
        description,
        max_job_posts: Number(max_job_posts),
        is_premium: Boolean(is_premium),
        max_portfolio: Number(max_portfolio),
        price: parseFloat(price),
      });

      return res.status(201).json(newPackage);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
}
