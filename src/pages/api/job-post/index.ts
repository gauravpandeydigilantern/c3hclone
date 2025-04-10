import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Prisma client
const prisma = new PrismaClient();

// Configure multer storage for multiple file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

// Create multer upload instance with multiple file handling
const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// Promisify multer upload for multiple files
const uploadMiddleware = (req: NextApiRequest, res: NextApiResponse) => {
  return new Promise<void>((resolve, reject) => {
    // Use fields to handle multiple file inputs
    upload.fields([
      { name: 'videoImage', maxCount: 1 },
      { name: 'addMedia', maxCount: 1 }
    ])(req as any, res as any, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Helper function to parse multi-select fields
const parseMultiSelectField = (field: any): string[] => {
  if (!field) return [];
  
  // If it's a string (single value), convert to array
  if (typeof field === 'string') {
    return [field];
  }
  
  // If it's an array of strings or objects with value property
  return Array.isArray(field) 
    ? field.map(item => 
        typeof item === 'object' && item.value 
          ? item.value.toString() 
          : item.toString()
      )
    : [];
};

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      // Handle file upload
      await uploadMiddleware(req, res);

      // @ts-ignore
      const files = req.files as { 
        videoImage?: Express.Multer.File[], 
        addMedia?: Express.Multer.File[] 
      };

      // Create job posting
      const jobPost = await prisma.jobPost.create({
        data: {
          jobTitle: req.body.jobTitle as string,
          jobDescription: req.body.jobDescription as string,
          certifications: req.body.certifications as string,
          jobSpecificDetails: req.body.jobSpecificDetails as string,
          location: req.body.location as string,
          salaryMin: req.body.salaryMin 
            ? parseFloat(req.body.salaryMin as string) 
            : null,
          salaryMax: req.body.salaryMax 
            ? parseFloat(req.body.salaryMax as string) 
            : null,
          experience: req.body.experience 
            ? parseInt(req.body.experience as string) 
            : null,
          gender: req.body.gender as string,
          salaryCurrency: req.body.salaryCurrency as string,
          companyName: req.body.companyName as string,
          companyWebsite: req.body.companyWebsite as string,
          videoUrl: req.body.videoUrl as string,
          
          // Handle video image file
          videoImage: files?.videoImage?.[0] 
            ? `/uploads/${files.videoImage[0].filename}` 
            : null,
          
          // Handle additional media file
          addMedia: files?.addMedia?.[0] 
            ? `/uploads/${files.addMedia[0].filename}` 
            : null,
          
          focusKeyphrase: req.body.focusKeyphrase as string,
          seoTitle: req.body.seoTitle as string,
          metaDescription: req.body.metaDescription as string,
          trackSeo: req.body.trackSeo == 'true',
          isSaleryHide: req.body.isSaleryHide == 'true',

          // Handle multi-select fields
          jobType: req.body.jobTypes 
            ? parseMultiSelectField(req.body.jobTypes)[0] 
            : null,
          jobCategories: parseMultiSelectField(req.body.jobCategories),
          tags: parseMultiSelectField(req.body.tags),
          qualifications: parseMultiSelectField(req.body.qualification),
          careerLevels: parseMultiSelectField(req.body.careerLevel),
          jobSkills: parseMultiSelectField(req.body.jobSkills),
          saveDraft: req.body.saveDraft === 'true',
        }
      });

      res.status(201).json(jobPost);
    } catch (error) {
      console.error('Job posting creation error:', error);
      res.status(500).json({ error: 'Failed to create job posting', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }  else if (req.method === 'GET') {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 5;
      const skip = (page - 1) * limit;
      const search = req.query.search?.toString() || "";

      const jobs = await prisma.jobPost.findMany({
        select: {
          id: true,
          jobTitle: true,
          user_id: true,
          companyName: true,
          companyWebsite: true,
          country: true,
          status: true,
          saveDraft: true,
        },
        skip,
        take: limit,
        where: {
          OR: [
            { companyName: { contains: search, mode: "insensitive" } },
            { jobTitle: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
      const totalJobs = await prisma.jobPost.count({
        where: {
          OR: [
            { companyName: { contains: search, mode: "insensitive" } },
            { jobTitle: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
          ],
        },
      });
      
      return res.status(200).json({ jobs, totalPages: Math.ceil(totalJobs / limit) });
    } catch (error) {
      console.error('Job postings fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch job postings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Disable body parser to allow multer to handle the request
export const config = {
  api: {
    bodyParser: false,
  },
};