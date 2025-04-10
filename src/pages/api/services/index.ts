import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createService, getAllServices } from "@/controllers/servicesController";

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
  if (req.method === "POST") {
    return new Promise((resolve, reject) => {
      upload.fields([
        { name: "image", maxCount: 1 },
        { name: "work_video", maxCount: 1 },
      ])(req as any, res as any, async (err) => {
        if (err) {
          res.status(500).json({ message: "File upload failed", error: err });
          return reject(err);
        }

        const { name, base_price, description } = req.body;
        const imagePath = req.files["image"] ? `/uploads/services/${(req.files["image"] as Express.Multer.File[])[0].filename}` : null;
        // const workVideoPath = req.files["work_video"] ? `/uploads/services/${(req.files["work_video"] as Express.Multer.File[])[0].filename}` : null;


        try {
          const service = await createService({
            name,
            image: imagePath,
            // base_price,
            // work_video: workVideoPath,
            description,
          });

          return res.status(201).json({ message: "Service created", success: true });
        } catch (err) {
          console.error("Error creating service:", err);
          return res.status(500).json({ message: "Failed to create service", error: err });
        }
      });
    });
  }

  if (req.method === "GET") {
     try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 5;
      const services = await getAllServices(page, limit);
      return res.status(200).json(services);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
