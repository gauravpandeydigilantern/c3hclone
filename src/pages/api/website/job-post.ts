import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { authenticate } from "@/middleware/authApimiddleare";
import cors from "@/lib/cors";

// Prisma client
const prisma = new PrismaClient();

// Configure multer storage for multiple file uploads
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
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
  fileFilter: (_req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif|webp|pdf/;
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
// Promisify multer upload for multiple files
const uploadMiddleware = (req: NextApiRequest, res: NextApiResponse) => {
  return new Promise<void>((resolve, reject) => {
    // Use fields to handle multiple file inputs
    upload.fields([
      { name: 'videoImage', maxCount: 1 },
      { name: 'addMedia', maxCount: 1 },
      { name: 'images', maxCount: 10 } // Allow up to 10 files for the 'images' field
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

// Helper function to prepare job post data
const prepareJobPostData = (body: any, files: any) => {
  console.log(body, "body")
  return {
    jobTitle: body.jobTitle as string,
    jobDescription: body.jobDescription as string,
    certifications: body.certifications as string,
    jobSpecificDetails: body.jobSpecificDetails as string,
    location: body.location as string,
    city: body.city as string,
    country: body.country as string,
    state: body.state as string,
    // expirationDate
    expirationDate: body.expirationDate 
      ? new Date(body.expirationDate as string) 
      : null,
    isSaleryHide: body.isSaleryHide =='true',
    salaryCurrency: body.salaryCurrency as string,
    salaryMin: body.salaryMin 
      ? parseFloat(body.salaryMin as string) 
      : null,
    salaryMax: body.salaryMax 
      ? parseFloat(body.salaryMax as string) 
      : null,
    experience: body.experience 
      ? parseInt(body.experience as string) 
      : null,
    gender: body.gender as string,
    companyName: body.companyName as string,
    companyWebsite: body.companyWebsite as string,
    videoUrl: body.videoUrl as string,
    
    // Handle video image file - preserve existing if not provided in update
    videoImage: files?.videoImage?.[0] 
      ? `/uploads/${files.videoImage[0].filename}` 
      : (body.existingVideoImage || null),
    
    // Handle additional media file - preserve existing if not provided in update
    addMedia: files?.addMedia?.[0] 
      ? `/uploads/${files.addMedia[0].filename}` 
      : (body.existingAddMedia || null),
    
    focusKeyphrase: body.focusKeyphrase as string,
    seoTitle: body.seoTitle as string,
    metaDescription: body.metaDescription as string,
    trackSeo: body.trackSeo == 'true',

    // Handle multi-select fields
    jobType: body.jobTypes 
      ? parseMultiSelectField(body.jobTypes)[0] 
      : parseMultiSelectField(body.jobType)[0] || null,
    jobCategories: parseMultiSelectField(body.jobCategories),
    tags: parseMultiSelectField(body.tags),
    qualifications: parseMultiSelectField(body.qualifications),
    careerLevels: parseMultiSelectField(body.careerLevels),
    jobSkills: parseMultiSelectField(body.jobSkills),
    saveDraft: body.saveDraft == 'true',
  };
};

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  await cors(req, res);
  try {
    // Authenticate user
    const decoded:any = await authenticate(req, res);  // Await the result from authenticate
  
    if (!decoded) {
      return; // If authentication fails, stop the process
    }
  

    // Check for proper authorization
    if (decoded.role === "user") {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }
    const userId = decoded.id;
    console.log(userId, "userId");
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'POST':
        return handlePost(req, res, userId);
        case 'GET':
          if (req.query.id) {
            return getSingleJob(req, res, userId);
          } else {
            return handleGet(req, res, userId);
          }
      case 'PUT':
        return handlePut(req, res, userId);
      case 'DELETE':
        return handleDelete(req, res, userId);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Handle POST requests
async function handlePost(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // Handle file upload
    await uploadMiddleware(req, res);

    // @ts-ignore
    const files = req.files as { 
      videoImage?: Express.Multer.File[], 
      addMedia?: Express.Multer.File[] 
    };

    // Add user_id to the job post data
    const jobPostData = {
      ...prepareJobPostData(req.body, files),
      user_id: userId
    };

    // Create job posting
    const jobPost = await prisma.jobPost.create({
      data: jobPostData
    });

    return res.status(201).json(jobPost);
  } catch (error) {
    console.error('Job posting creation error:', error);
    return res.status(500).json({ 
      error: 'Failed to create job posting', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Handle GET requests
async function handleGet(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const search = req.query.search?.toString() || "";

    

    // Get jobs with pagination
    const jobs = await prisma.jobPost.findMany({
      skip,
      take: limit,
      where: {
        AND: [
          { user_id: userId },
          {
            OR: [
              { companyName: { contains: search, mode: "insensitive" } },
              { jobTitle: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
            ],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // Get total count for pagination
    const totalJobs = await prisma.jobPost.count({
      where: {
        AND: [
          { user_id: userId },
          {
            OR: [
              { companyName: { contains: search, mode: "insensitive" } },
              { jobTitle: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
            ],
          },
        ],
      },
    });
    
    return res.status(200).json({ 
      jobs, 
      totalPages: Math.ceil(totalJobs / limit),
      currentPage: page,
      totalJobs 
    });
  } catch (error) {
    console.error('Job postings fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch job postings' });
  }
}

// Handle PUT requests
async function handlePut(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    await uploadMiddleware(req, res);

    // @ts-ignore
    const files = req.files as { 
      videoImage?: Express.Multer.File[], 
      addMedia?: Express.Multer.File[] 
    };

    const jobId = req.body.job_id;
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Fetch existing job post
    const existingJobPost = await prisma.jobPost.findUnique({ 
      where: { 
        id: jobId,
        user_id: userId 
      }
    });
    
    if (!existingJobPost) {
      return res.status(404).json({ error: 'Job post not found' });
    }

    // Prepare data for update with existing files if not provided
    const updateData = prepareJobPostData(
      { 
        ...req.body,
        existingVideoImage: existingJobPost.videoImage,
        existingAddMedia: existingJobPost.addMedia
      }, 
      files
    );

    // Update job posting
    const updatedJobPost = await prisma.jobPost.update({
      where: { 
        id: jobId
      },
      data: updateData
    });

    return res.status(200).json(updatedJobPost);
  } catch (error) {
    console.error('Job posting update error:', error);
    return res.status(500).json({ 
      error: 'Failed to update job posting', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Handle DELETE requests
async function handleDelete(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const jobId = req.query.id as string;
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Check if job exists and belongs to user
    const existingJob = await prisma.jobPost.findUnique({
      where: {
        id: jobId,
        user_id: userId
      }
    });

    if (!existingJob) {
      return res.status(404).json({ error: 'Job post not found' });
    }

    // Delete job post
    await prisma.jobPost.delete({
      where: {
        id: jobId
      }
    });

    return res.status(200).json({ message: 'Job posting deleted successfully' });
  } catch (error) {
    console.error('Job posting deletion error:', error);
    return res.status(500).json({ error: 'Failed to delete job posting' });
  }
}

async function getSingleJob(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const jobId = req.query.id as string;
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Find the job post with the specified ID belonging to the user
    const jobPost = await prisma.jobPost.findUnique({
      where: {
        id: jobId,
        user_id: userId
      }
    });

    if (!jobPost) {
      return res.status(404).json({ error: 'Job post not found' });
    }

    return res.status(200).json({ job: jobPost });
  } catch (error) {
    console.error('Job post fetch error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch job post', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Disable body parser to allow multer to handle the request
export const config = {
  api: {
    bodyParser: false,
  },
};