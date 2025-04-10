import { getTestimonialById, updateTestimonial, deleteTestimonial } from "@/controllers/testimonialController";
import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), "public/uploads/testimonials");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false, // Required for multer
  },
};

// Middleware to handle multer
const runMiddleware = (req: any, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const testimonial = await getTestimonialById(id as string);
      if (!testimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      return res.status(200).json(testimonial);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching testimonial", error });
    }
  }

  if (req.method === "PUT") {
    await runMiddleware(req, res, upload.single("image"));

    // Multer does not parse text fields; they must be manually retrieved
    const { name, position, description } = req.body;
    const file = (req as any).file;
    let imagePath: string | undefined;

    // Only update the image if a new file is uploaded
    if (file) {
      imagePath = `/uploads/testimonials/${file.filename}`;
    }

    try {
      const updateData: any = { name, position, description };
      if (imagePath) {
        updateData.image = imagePath;
      }

      const updatedTestimonial = await updateTestimonial(id as string, updateData);

      return res.status(200).json({ message: "Updated successfully", updatedTestimonial });
    } catch (error) {
      return res.status(500).json({ message: "Error updating testimonial", error });
    }
  }

  if (req.method === "DELETE") {
    try {
      await deleteTestimonial(id as string);
      return res.status(204).send("");
    } catch (error) {
      return res.status(500).json({ message: "Error deleting testimonial", error });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
