import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createTestimonial, getAllTestimonials } from "@/controllers/testimonialController";

// Ensure the "uploads" folder exists
const uploadDir = path.join(process.cwd(), "public/uploads/testimonials");
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return new Promise((resolve, reject) => {
      upload.single("image")(req as any, res as any, async (err) => {
        if (err) {
          res.status(500).json({ message: "File upload failed", error: err });
          return reject(err);
        }

        const { name, position, description } = req.body;
        const imagePath = `/uploads/testimonials/${(req as any).file.filename}`;
        console.log(imagePath, "imagepath");
        if (!name || !position || !description) {
          return res.status(400).json({ message: "All fields are required" });
        }
        console.log(position, "ewasdy");

        const testimonial = await createTestimonial(name, position, description, imagePath );
        console.log(testimonial, "testimonial");

        return res.status(201).json({ message: "Testimonial created", success:true });
      });
    });
  }

  if (req.method === "GET") {
    const testimonials = await getAllTestimonials();
    return res.status(200).json(testimonials);
  }
}
