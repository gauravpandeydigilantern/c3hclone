import multer from 'multer';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { authenticate } from "@/middleware/authMiddleware";
const prisma = new PrismaClient();

// Set up Multer storage configuration to store files locally in the "public/uploads" folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads'); // Save to the "public/uploads" folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Create a multer instance with the storage configuration
const upload = multer({ storage });

// This handler will process the uploaded files
export const config = {
  api: {
    bodyParser: false, // Disable default body parser for handling file uploads
  },
};

const uploadMiddleware = upload.fields([
  { name: 'banner', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
]);

export default authenticate ( async function handler(req:any, res:any) {
  if (req.method === 'POST') {
    // Use Multer middleware to handle the file uploads
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error uploading files' });
      }

      // Get form data
      const { name, facebook, instagram, xLink, email, phone, address, description } = req.body;

      // Retrieve the paths for the uploaded files (if any)
      const banner = req.files?.banner ? `/uploads/${req.files.banner[0].filename}` : req.body.banner || '';
      const logo = req.files?.logo ? `/uploads/${req.files.logo[0].filename}` : req.body.logo || '';

      try {
        // Create a new site entry in the database
        const site = await prisma.siteManagement.update({
          where: { id:"338072bd-c5dd-49eb-9192-f74f9e378a1d" },
          data: {
            name,
            facebook,
            instagram,
            xLink,
            email,
            banner, // Path to the banner image
            phone,
            logo, // Path to the logo image
            address,
            description,
          },
        });

        // Return the created site data as a response
        return res.status(201).json(site);
      } catch (error) {
        console.error('Error creating site management:', error);
        return res.status(500).json({ error: 'Error saving the site data' });
      }
    });
  } else if(req.method === 'GET'){
      const data = await prisma.siteManagement.findFirst();
      return res.status(200).json({ data });
  } else {
    // Method Not Allowed for other HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
});
