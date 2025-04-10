import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Initialize Prisma client
const prisma = new PrismaClient();

// Configure multer storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueSuffix);
    },
});

// Multer instance with file size and type restrictions
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedFileTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'));
        }
    },
});

// Middleware to handle file uploads
const uploadMiddleware = (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve, reject) => {
        upload.fields([
            { name: 'videoImage', maxCount: 1 },
            { name: 'addMedia', maxCount: 1 },
        ])(req as any, res as any, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

// Helper function to parse multi-select fields
const parseMultiSelectField = (field: any): string[] => {
    if (!field) return [];
    if (typeof field === 'string') return [field];
    return Array.isArray(field)
        ? field.map((item) =>
                typeof item === 'object' && item.value ? item.value.toString() : item.toString()
            )
        : [];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Job post ID is required and must be a string' });
    }

    
    try {
        if (req.method === "GET") {
            try {
                const jobData = await prisma.jobPost.findUnique({
                    where: { id: id },
                });
    
                if (!jobData) {
                    return res.status(404).json({ message: "Job not found" });
                }
    
                return res.status(200).json(jobData);
            } catch (error) {
                console.error("Error fetching job:", error);
                return res.status(500).json({ 
                    message: "Failed to fetch job", 
                    error: error instanceof Error ? error.message : String(error) 
                });
            }
        }
        else if (req.method === 'PUT') {
            // Handle file uploads
            await uploadMiddleware(req, res);

            // @ts-ignore
            const files = req.files as {
                videoImage?: Express.Multer.File[];
                addMedia?: Express.Multer.File[];
            };

            // Fetch existing job post
            const existingJobPost = await prisma.jobPost.findUnique({ where: { id } });
            if (!existingJobPost) {
                return res.status(404).json({ error: 'Job post not found' });
            }

            // Update job post
            const updatedJobPost = await prisma.jobPost.update({
                where: { id },
                data: {
                    jobTitle: req.body.jobTitle as string,
                    jobDescription: req.body.jobDescription as string,
                    certifications: req.body.certifications as string,
                    jobSpecificDetails: req.body.jobSpecificDetails as string,
                    location: req.body.location as string,
                    salaryMin: req.body.salaryMin ? parseFloat(req.body.salaryMin as string) : null,
                    salaryMax: req.body.salaryMax ? parseFloat(req.body.salaryMax as string) : null,
                    experience: req.body.experience ? parseInt(req.body.experience as string) : null,
                    gender: req.body.gender as string,
                    salaryCurrency: req.body.salaryCurrency as string,
                    isFeatured: req.body.isFeatured === 'true',
                    isSaleryHide: req.body.isSaleryHide === 'true',
                    companyName: req.body.companyName as string,
                    companyWebsite: req.body.companyWebsite as string,
                    videoUrl: req.body.videoUrl as string,
                    videoImage: files?.videoImage?.[0]
                        ? `/uploads/${files.videoImage[0].filename}`
                        : existingJobPost.videoImage,
                    addMedia: files?.addMedia?.[0]
                        ? `/uploads/${files.addMedia[0].filename}`
                        : existingJobPost.addMedia,
                    focusKeyphrase: req.body.focusKeyphrase as string,
                    seoTitle: req.body.seoTitle as string,
                    metaDescription: req.body.metaDescription as string,
                    trackSeo: req.body.trackSeo === 'true',
                    jobType: req.body.jobTypes ? parseMultiSelectField(req.body.jobTypes)[0] : null,
                    jobCategories: parseMultiSelectField(req.body.jobCategories),
                    tags: parseMultiSelectField(req.body.tags),
                    qualifications: parseMultiSelectField(req.body.qualification),
                    careerLevels: parseMultiSelectField(req.body.careerLevel),
                    jobSkills: parseMultiSelectField(req.body.jobSkills),
                    saveDraft: req.body.saveDraft === 'true',
                },
            });

            // Remove old files if new ones are uploaded
            if (files?.videoImage?.[0] && existingJobPost.videoImage) {
                const oldVideoImagePath = path.join(process.cwd(), 'public', existingJobPost.videoImage);
                if (fs.existsSync(oldVideoImagePath)) {
                    fs.unlinkSync(oldVideoImagePath);
                }
            }

            if (files?.addMedia?.[0] && existingJobPost.addMedia) {
                const oldAddMediaPath = path.join(process.cwd(), 'public', existingJobPost.addMedia);
                if (fs.existsSync(oldAddMediaPath)) {
                    fs.unlinkSync(oldAddMediaPath);
                }
            }

            return res.status(200).json(updatedJobPost);
        } else if (req.method === 'DELETE') {
            // Fetch existing job post
            const existingJobPost = await prisma.jobPost.findUnique({ where: { id } });
            if (!existingJobPost) {
                return res.status(404).json({ error: 'Job post not found' });
            }

            // Delete job post
            const deletedJobPost = await prisma.jobPost.delete({ where: { id } });
            return res.status(200).json(deletedJobPost);
        } else {
            res.setHeader('Allow', ['PUT', 'DELETE', "GET"]);
            return res.status(405).json({
                message: `Method ${req.method} Not Allowed`,
                allowedMethods: ['PUT', 'DELETE', "GET"],
            });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

// Disable body parser to allow multer to handle the request
export const config = {
    api: {
        bodyParser: false,
    },
};
