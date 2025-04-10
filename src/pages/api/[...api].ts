import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "@/middleware/authApimiddleare";
import bcrypt from "bcryptjs";
import cors from "@/lib/cors";


const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await cors(req, res); 
    const { api } = req.query; 
    const decoded: any = await authenticate(req, res);
    if (!decoded) return;
    const userId = decoded.id;
    const apipath = Array.isArray(api) ? api.join("/") : api || "";
    
    if (apipath === "orders") {
        if (req.method === "GET") {
            return res.json({ orders: ["Order1", "Order2", "Order3"] });
        }
        if (req.method === "POST") {
            return res.status(201).json({ message: "Order created" });
        }
    }

    if (apipath === "add-personal-details") {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
    
      try {
        // Now extract the form data
        const { 
          name, 
          email, 
          phone, 
          is_hiring_manager, 
          managerName, 
          managerEmail, 
          managerPhone,
          company_name,
          role 
        } = req.body;
        
  
        // Update User
        const newUser = await prisma.user.update({
          where: { id: userId },
          data: {
            name, 
            email, 
            phone, 
            is_hiring_manager, 
            managerName, 
            managerEmail, 
            managerPhone,
            company_name: role === "employer" ? company_name : null,
          },
        });
        
        return res.status(200).json({
          message: "Personal details updated successfully",
          user: { 
            id: newUser.id, 
            email: newUser.email, 
            role: newUser.role, 
            profile_image: newUser.profile_image 
          },
        });
      } catch (error:any) {
        return res.status(500).json({
          message: "Database operation failed",
          error: error.message
        });
      }
    }

    if (apipath === "add-company-deatils") {
      const { companyName, companyWebsite, Industry, founded, companySize, location,billingCountry , billingState, billingCity, billingZipcode, billingAddress, billingApartmentSuite  } = req.body;
     
            // **Create User**
            const newUser = await prisma.user.update({
              where : {id:userId},
              data: {
                companyName, companyWebsite, Industry, founded, companySize, location,billingCountry , billingState, billingCity, billingZipcode, billingAddress, billingApartmentSuite,
              },
            });
      
            return res.status(201).json({
              message: "Signup successful",
              user: { id: newUser.id, email: newUser.email, role: newUser.role, profile_image: newUser.profile_image },
            });
      
    }

    if(apipath === "change-password"){
      const userId = decoded.id;
      const { currentPassword, newPassword } = req.body;
      try {
        // Fetch user
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { password: true } // Ensure the password field exists
        });
    
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
    
        // Compare current password
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
          return res.status(400).json({ error: "Current password is incorrect" });
        }
        // // Ensure new password is strong (8+ chars, one number, one special char)
        // const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/;
        // if (!passwordRegex.test(newPassword)) {
        //   return res.status(400).json({
        //     error: "New password must be at least 8 characters long, include a number and a special character"
        //   });
        // }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
    
        await prisma.user.update({
          where: { id: userId },
          data: { password: hashedPassword }
        });
    
        res.status(200).json({ message: "Password changed successfully" });
      } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ error: "Failed to change password" });
      }
    }

    if(apipath === "save-candidates"){
      const { userId, saveCandidateId } = req.body;
      if (req.method === "POST") {
        try {
          // Ensure a user can't favorite themselves
          if (userId === saveCandidateId) {
            return res.status(400).json({ error: "You can't save yourself" });
          }
      
          // Check if the favorite entry already exists
          const existingSaveUser = await prisma.saveCandidateUser.findFirst({
            where: { userId, saveCandidateId },
          });
      
          if (existingSaveUser) {
            // Delete the existing favorite
            await prisma.saveCandidateUser.delete({
              where: { id: existingSaveUser.id },
            });
      
            return res.status(200).json({ message: "Removed from saved" });
          } else {
            // Create a new favorite entry
            const save_user = await prisma.saveCandidateUser.create({
              data: { userId, saveCandidateId },
            });
      
            return res.status(201).json(save_user);
          }
        } catch (error) {
          console.error("Error saving user:", error);
          return res.status(500).json({ error: "Failed to save user" });
        }
      }
      
      if (req.method === "GET") {

          const userId = decoded.id;
          const page = Number(req.query.page) || 1;
          const limit = Number(req.query.limit) || 10;

          const skip = (page - 1) * limit;
      
          try {
              const savedUsers = await prisma.saveCandidateUser.findMany({
                  where: { userId: userId as string },
                  include: {
                      saveCandidate: {
                          select: {
                              id: true,
                              name: true,
                              email: true,
                              phone: true,
                          },
                      },
                  },
                  skip: skip,
                  take: limit,
              });
      
              // Optionally, count total number of records to calculate total pages
              const totalUsers = await prisma.saveCandidateUser.count({
                  where: { userId: userId as string },
              });
      
              const totalPages = Math.ceil(totalUsers / limit); // Total pages based on count and limit
      
              res.status(200).json({
                  savedUsers,
                  pagination: {
                      totalUsers,
                      totalPages,
                      currentPage: Number(page),
                      pageSize: limit,
                  },
              });
          } catch (error) {
              console.error("Error fetching favorite users:", error);
              res.status(500).json({ error: "Failed to fetch favorite users" });
          }
      }         
    }
    if(apipath === "website/user-jobs"){
      if (req.method === "GET") {
        try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 9;
        const skip = (page - 1) * limit;
        const search = req.query.search?.toString() || "";
        const dateFilter = req.query.createdAt?.toString() || 'all';
    
        // Parse multiple filters (comma-separated values)
        const jobCategoryFilter = req.query.jobCategory ? req.query.jobCategory.toString().split(',').map(String) : [];
        const jobSkillFilter = req.query.jobSkill ? req.query.jobSkill.toString().split(',').map(String) : [];
        const jobTypeFilter = req.query.jobType ? req.query.jobType.toString().split(',').map(String) : [];
        const careerLevelFilter = req.query.careerLevel ? String(req.query.careerLevel) : null;
    
        // Determine the date filter
        let createdAtFilter = {};
        if (dateFilter === 'last24Hours') {
          createdAtFilter = {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
            },
          };
        } else if (dateFilter === 'lastWeek') {
          createdAtFilter = {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            },
          };
        } else if (dateFilter === 'lastMonth') {
          createdAtFilter = {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            },
          };
        }
    
        // Fetch jobs with pagination and filtering (including multiple filters)
        const jobs = await prisma.jobPost.findMany({
          skip,
          take: limit,
          where: {
            AND: [
              {
                user_id: userId,
              },
              {
                OR: [
                  { companyName: { contains: search, mode: "insensitive" } },
                  { jobTitle: { contains: search, mode: "insensitive" } },
                  { location: { contains: search, mode: "insensitive" } },
                ],
              },
              jobCategoryFilter.length ? { jobCategories: { hasSome: jobCategoryFilter } } : {},
              jobSkillFilter.length ? { jobSkills: { hasSome: jobSkillFilter } } : {},
              jobTypeFilter.length ? { jobType: { in: jobTypeFilter } } : {},
              careerLevelFilter ? { careerLevels: { has: careerLevelFilter } } : {},
              // industryFilter ? { industry: industryFilter } : {},
              createdAtFilter,  // Add the date filter here
            ],
          },
          orderBy: { createdAt: "desc" },
        });
    
        if (jobs.length === 0) {
          return res.status(200).json({
            jobs: [],
            totalPages: 0,
            currentPage: page,
            totalJobs: 0,
          });
        }
    
    
        // 🔹 Fetch related data using your custom method
        const jobCategories = await prisma.jobCategory.findMany({
          where: { id: { in: jobs.flatMap(job => job.jobCategories || []) } },
          select: { id: true, name: true },
        });
    
        const jobTypes = await prisma.jobType.findMany({
          where: { id: { in: jobs.map(job => job.jobType).filter((type): type is string => type !== null) } },
          select: { id: true, name: true },
        });
    
        const jobSkills = await prisma.jobSkill.findMany({
          where: { id: { in: jobs.flatMap(job => job.jobSkills || []) } },
          select: { id: true, name: true },
        });
    
        const qualifications = await prisma.qualification.findMany({
          where: { id: { in: jobs.flatMap(job => job.qualifications || []) } },
          select: { id: true, name: true },
        });
    
        const careerLevels = await prisma.careerLevel.findMany({
          where: { career_level_id: { in: jobs.flatMap(job => job.careerLevels || []) } },
          select: { career_level_id: true, name: true },
        });
    
        const employerIds = jobs.map(job => job.user_id).filter(id => id !== null);
    
        const employers = await prisma.user.findMany({
          where: { id: { in: employerIds } },
          select: { id: true, name: true, profile_image: true, phone: true },
        });
    
        // 🔹 Map related data into jobs
        const jobsWithRelations = jobs.map(job => ({
          ...job,
          jobCategories: jobCategories.filter(cat => job.jobCategories?.includes(cat.id)),
          jobType: jobTypes.find(type => type.id === job.jobType) || null,
          jobSkills: jobSkills.filter(skill => job.jobSkills?.includes(skill.id)),
          qualifications: qualifications.filter(qual => job.qualifications?.includes(qual.id)),
          careerLevels: careerLevels.filter(level => job.careerLevels?.includes(level.career_level_id)),
          employer: employers.find(emp => emp.id === job.user_id) || null,
        }));
    
        // Get total count for pagination
        const totalJobs = await prisma.jobPost.count({
          where: {
            AND: [
              {
                user_id: userId,
              },
              {
                OR: [
                  { companyName: { contains: search, mode: "insensitive" } },
                  { jobTitle: { contains: search, mode: "insensitive" } },
                  { location: { contains: search, mode: "insensitive" } },
                ],
              },
              jobCategoryFilter.length ? { jobCategories: { hasSome: jobCategoryFilter } } : {},
              jobSkillFilter.length ? { jobSkills: { hasSome: jobSkillFilter } } : {},
              jobTypeFilter.length ? { jobType: { in: jobTypeFilter } } : {},
              careerLevelFilter ? { careerLevels: { has: careerLevelFilter } } : {},
              // industryFilter ? { industry: industryFilter } : {},
              createdAtFilter,  // Add the date filter here
            ],
          },
        });
    
        return res.status(200).json({
          jobs: jobsWithRelations,
          totalPages: Math.ceil(totalJobs / limit),
          currentPage: page,
          totalJobs,
        });
        } catch (error) {
          console.error("Job postings fetch error:", error);
          return res.status(500).json({ error: "Failed to fetch job postings" });
        }
      }
    }

    if(apipath === "website/employer-dashboard"){
      if (req.method === "GET") {
        try {
          // Use Promise.all to execute queries concurrently
          const [totalJobs, totalActiveJobs, totalSaveCandidates] = await Promise.all([
              prisma.jobPost.count({ where: { user_id: userId } }),
              prisma.jobPost.count({ where: { user_id: userId, status: true, saveDraft:false } }),
              prisma.saveCandidateUser.count({ where: { userId: userId as string } }),
          ]);

          // Final Response
          return res.status(200).json({
            totalJobs,
            totalActiveJobs,
            totalSaveCandidates,
          });
        } catch (error) {
          console.error("Homepage API error:", error);
          return res.status(500).json({ error: "Failed to fetch homepage data" });
        }
      }
    }

    return res.status(404).json({ message: "API route not found" });
}

