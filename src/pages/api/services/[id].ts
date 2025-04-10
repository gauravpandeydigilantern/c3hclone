import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getServiceById, updateService, deleteService } from "@/controllers/servicesController";

// Ensure the "uploads" folder exists
const uploadDir = path.join(process.cwd(), "public/uploads/services");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser so multer can handle the request
  },
};

interface NextApiRequestWithFiles extends NextApiRequest {
  files: any;
}

export default async function handler(req: NextApiRequestWithFiles, res: NextApiResponse) {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const serviceData = await getServiceById(id as string);
      if (!serviceData) return res.status(404).json({ message: "Service not found" });
      return res.status(200).json(serviceData);
    }

    if (req.method === "PUT") {
      upload.fields([{ name: "image", maxCount: 1 }, { name: "work_video", maxCount: 1 }])(
        req as any,
        res as any,
        async (err) => {
          if (err) {
            return res.status(500).json({ message: "File upload failed", error: err });
          }

          const { name, base_price, description } = req.body;
          const files = req.files as { [fieldname: string]: Express.Multer.File[] };

          const imagePath = files?.image?.[0]?.filename ? `/uploads/services/${files.image[0].filename}` : undefined;
          // const workVideoPath = files?.work_video?.[0]?.filename ? `/uploads/services/${files.work_video[0].filename}` : undefined;

          // Validate required fields
          if (!name) {
            return res.status(400).json({ message: "Missing required fields" });
          }

          // const basePriceFloat = parseFloat(base_price);
          // if (isNaN(basePriceFloat)) {
          //   return res.status(400).json({ message: "Invalid base_price. Must be a number." });
          // }

          const updatedService = await updateService(id as string, {
            name,
            image: imagePath,
            // work_video: workVideoPath,
            // base_price: basePriceFloat, // Ensure it's a Float
            description,
          });

          return res.status(200).json({ message: "Service updated", updatedService });
        }
      );
      return;
    }

    if (req.method === "DELETE") {
      await deleteService(id as string);
      return res.status(204).send("");
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
}

