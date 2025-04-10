import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Dynamically import CKEditor with SSR disabled
const CKEditor = dynamic(
  () => import('@ckeditor/ckeditor5-react').then(mod => mod.CKEditor),
  { ssr: false }
);



// Type definitions for options
interface SelectOption {
    value: string | number;
    label: string;
}
const Select = dynamic(() => import("react-select"), { ssr: false });

export default function JobPostingForm() {
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();
    
    useEffect(() => {  
        const tokenData = localStorage.getItem("token");
        if (!tokenData) {
          router.push("/admin/login");
          return;
        }
        const { token, expiresAt } = JSON.parse(tokenData);
        if (new Date().getTime() > expiresAt) {
          localStorage.removeItem("token"); 
          router.push("/admin/login");
        } 
      }, []);

    const [jobSkills, setJobSkills] = useState<SelectOption[]>([]);
    const [jobTypes, setJobTypes] = useState<SelectOption[]>([]);
    const [jobCategories, setJobCategories] = useState<SelectOption[]>([]);
    const [tags, setTags] = useState<SelectOption[]>([]);
    const [careerLevels, setCareerLevels] = useState<SelectOption[]>([]);
    const [qualifications, setQualifications] = useState<SelectOption[]>([]);

    const { id } = router.query;

    const [formData, setFormData] = useState({
        jobTitle: "",
        jobDescription: "",
        jobTypes: null as SelectOption | null,
        jobCategories: [] as SelectOption[],
        location: "",
        salaryMax: "",
        salaryMin: "",
        applyLink: "",
        companyName: "",
        companyWebsite: "",
        videoUrl: "",
        videoImage: null as File | string | null,
        qualification: [] as SelectOption[],
        experience: "",
        jobSkills: [] as SelectOption[],
        focusKeyphrase: "",
        seoTitle: "",
        metaDescription: "",
        trackSeo: false,
        tags: [] as SelectOption[],
        gender: "",
        salaryCurrency: "",
        careerLevel: [] as SelectOption[],
        addMedia: null as File | null,
        certifications: "",
        jobSpecificDetails: "",
        saveDraft: false,
        isHideSalary: false,
    });

    useEffect(() => {
        setIsClient(true);
        fetchJobData();
    }, []);

    useEffect(() => {
        if (id) {
            fetchJobs();
        }
    }, [id, jobTypes, jobCategories, jobSkills, tags, careerLevels, qualifications]);

    const fetchJobs = async () => {
        try {
            const response = await fetch(`/api/job-post/${id}`);
            const data = await response.json();
    
            // Add null checks and fallback values
            setFormData(prevState => ({
                ...prevState,
                ...data,
                jobTypes: data.jobType && jobTypes.length > 0
                    ? { 
                        value: data.jobType, 
                        label: jobTypes.find(type => type.value === data.jobType)?.label || data.jobType 
                    }
                    : null,
                jobCategories: data.jobCategories?.length > 0 && jobCategories.length > 0
                    ? data.jobCategories
                        .map((categoryId: string) => 
                            jobCategories.find((category) => category.value === categoryId)
                        )
                        .filter(Boolean) // Remove any undefined items
                    : [],
                jobSkills: data.jobSkills?.length > 0 && jobSkills.length > 0
                    ? data.jobSkills
                        .map((skillId: string) => 
                            jobSkills.find((skill) => skill.value === skillId)
                        )
                        .filter(Boolean) // Remove any undefined items
                    : [],
                tags: data.tags?.length > 0 && tags.length > 0
                    ? data.tags
                        .map((tagId: string) => 
                            tags.find((tag) => tag.value === tagId)
                        )
                        .filter(Boolean) // Remove any undefined items
                    : [],
                careerLevel: data.careerLevels?.length > 0 && careerLevels.length > 0
                    ? data.careerLevels
                        .map((levelId: string) => 
                            careerLevels.find((level) => level.value === levelId)
                        )
                        .filter(Boolean) // Remove any undefined items
                    : [],
                qualification: data.qualifications?.length > 0 && qualifications.length > 0
                    ? data.qualifications
                        .map((qualificationId: string) => 
                            qualifications.find((qualification) => qualification.value === qualificationId)
                        )
                        .filter(Boolean) // Remove any undefined items
                    : [],
            }));
        } catch (error) {
            console.error("Error fetching job data:", error);
        }
    };


    const fetchJobData = async () => {
        try {
            const response = await fetch("/api/job-data");
            const data = await response.json();

            // Transform data into react-select format
            setJobSkills(data.jobSkills.map((item: any) => ({
                value: item.id,
                label: item.name,
            })));

            setJobTypes(data.jobTypes.map((item: any) => ({
                value: item.id,
                label: item.name,
            })));

            setJobCategories(data.jobCategories.map((item: any) => ({
                value: item.id,
                label: item.name,
            })));

            setCareerLevels(data.careerLevels.map((item: any) => ({
                value: item.career_level_id,
                label: item.name,
            })));

            setQualifications(data.qualifications.map((item: any) => ({
                value: item.id,
                label: item.name,
            })));

            setTags(data.tags.map((item: any) => ({
                value: item.tag_id,
                label: item.name,
            })));
        } catch (error) {
            console.error("Error fetching job data:", error);
        }
    };

    const handleChange = (name: string) => (selectedOption: any) => {
        setFormData((prevState) => ({
            ...prevState,
            [name]: selectedOption,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        const { name } = e.target;

        setFormData((prevState) => ({
            ...prevState,
            [name]: file,
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Create FormData for file upload
        const formDataToSubmit = new FormData();

        // Append all text fields
        Object.keys(formData).forEach((key) => {
            const value = formData[key as keyof typeof formData];

            // Handle single select fields
            if (key === 'jobTypes' && value) {
                formDataToSubmit.append(key, (value as SelectOption).value.toString());
            } 
            // Handle multi-select fields
            else if (key === 'jobCategories' || key === 'qualification' || 
                     key === 'jobSkills' || key === 'tags' || key === 'careerLevel') {
                const multiValues = value as SelectOption[];
                multiValues.forEach((item, index) => {
                    formDataToSubmit.append(`${key}[${index}]`, item.value.toString());
                });
            } 
            // Handle file inputs
            else if (key === 'videoImage' && value instanceof File) {
                formDataToSubmit.append(key, value);
            } 
            else if (key === 'addMedia' && value instanceof File) {
                formDataToSubmit.append(key, value);
            }
            // Handle other string/number/boolean fields
            else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                formDataToSubmit.append(key, value.toString());
            }
        });

        try {
            const response = await fetch(id ? `/api/job-post/${id}` : "/api/job-post", {
                method: id ? "PUT" : "POST",
                body: formDataToSubmit,
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Job posting submitted successfully", result);
                router.push("/admin/jobs");
            } else {
                // Improved error handling
                const errorData = await response.json();
                console.error("Submission failed", errorData);
                // Optionally, show error to user
                alert(`Submission failed: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error submitting job posting:", error);
            alert("An error occurred while submitting the job posting");
        }
    };

    if (!isClient) return null; // Prevent hydration mismatch
    const handleGoBack = () => {
        router.back();
      };
    return (
        <div>
            <div className="container mx-auto">
            <div className="flex justify-between items-center mb-4">
        
            <h1 className="text-2xl">{id ? "Edit Job Post" : "Add Job Post"}</h1>
          <button
            onClick={handleGoBack} 
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Back
        </button>
        </div>
            
            <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-xl rounded-xl p-5 space-y-8"
                >
                    {/* Job Details Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl border-b border-gray-300 pb-3">
                            Job Details
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                {/* Job Title */}
                                <div>
                                    <label 
                                        htmlFor="jobTitle" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Job Title
                                    </label>
                                    <input
                                        id="jobTitle"
                                        name="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={handleInputChange}
                                        placeholder="Enter job title"
                                        className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                    />
                                </div>

                                {/* Job Description */}
                                <div>
                                    <label 
                                        htmlFor="jobDescription" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Job Description
                                    </label>
                                    {/* <textarea
                                        id="jobDescription"
                                        name="jobDescription"
                                        value={formData.jobDescription}
                                        onChange={handleInputChange}
                                        placeholder="Describe the job responsibilities"
                                        rows={4}
                                        className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                    /> */}
                                     {/* <CKEditor
                                            editor={ClassicEditor}
                                            data="<p>Hello from CKEditor 5!</p>"
                                            onChange={(event, editor) => {
                                              const data = editor.getData();
                                              setEditorData(data);
                                              console.log('Editor data:', data);
                                            }}
                                          /> */}
                                    <div className="border-gray-300 border-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900">
                                        <CKEditor
                                            editor={ClassicEditor as any}
                                            data={formData.jobDescription}
                                            onChange={(event, editor) => {
                                                const data = editor.getData();
                                                setFormData((prevState) => ({
                                                    ...prevState,
                                                    jobDescription: data,
                                                }));
                                            }}
                                            config={{
                                                toolbar: [
                                                    'heading',
                                                    '|',
                                                    'bold',
                                                    'italic',
                                                    '|',
                                                    'link',
                                                    'bulletedList',
                                                    'numberedList',
                                                    '|',
                                                    'imageUpload',
                                                    'blockQuote',
                                                    '|',
                                                    'undo',
                                                   'redo',
                                                  ],
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Job Type - Single Select */}
                                <div>
                                    <label 
                                        htmlFor="jobTypes" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Job Type
                                    </label>
                                    <Select
                                        id="jobTypes"
                                        name="jobTypes"
                                        options={jobTypes}
                                        value={formData.jobTypes}
                                        onChange={handleChange('jobTypes')}
                                        placeholder="Select Job Type"
                                        isSearchable={true}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Job Categories - Multi-Select */}
                                <div>
                                    <label 
                                        htmlFor="jobCategories" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Job Categories
                                    </label>
                                    <Select
                                        id="jobCategories"
                                        name="jobCategories"
                                        options={jobCategories}
                                        value={formData.jobCategories}
                                        onChange={handleChange('jobCategories')}
                                        placeholder="Select Job Categories"
                                        isMulti
                                        isSearchable={true}
                                    />
                                </div>

                                {/* Tags - Multi-Select */}
                                <div>
                                    <label 
                                        htmlFor="tags" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Tags
                                    </label>
                                    <Select
                                        id="tags"
                                        name="tags"
                                        options={tags}
                                        value={formData.tags}
                                        onChange={handleChange('tags')}
                                        placeholder="Select Tags"
                                        isMulti
                                        isSearchable={true}
                                    />
                                </div>

                                {/* Gender */}
                                <div>
                                    <label 
                                        htmlFor="gender" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Gender
                                    </label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label 
                                        htmlFor="addMedia" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Add Media
                                    </label>
                                    
                                    <input
                                        id="addMedia"
                                        type="file"
                                        name="addMedia"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                    />
                                    {formData.addMedia && (
                                            <img
                                                src={typeof formData.addMedia === 'string' ? formData.addMedia : URL.createObjectURL(formData.addMedia)}
                                                alt="Current"
                                                className="w-32 h-32 object-cover border"
                                            />
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Requirements Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl border-b border-gray-300 pb-3">
                            Job Requirements
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                {/* Location */}
                                <div>
                                    <label 
                                        htmlFor="location" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Location
                                    </label>
                                    <input
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="City, Country"
                                        className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                    />
                                </div>

                                {/* Salary Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label 
                                            htmlFor="salaryMin" 
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Min Salary
                                        </label>
                                        <input
                                            id="salaryMin"
                                            name="salaryMin"
                                            type="number"
                                            value={formData.salaryMin}
                                            onChange={handleInputChange}
                                            placeholder="Minimum Salary"
                                            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                        />
                                    </div>
                                    <div>
                                        <label 
                                            htmlFor="salaryMax" 
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Max Salary
                                        </label>
                                        <input
                                            id="salaryMax"
                                            name="salaryMax"
                                            type="number"
                                            value={formData.salaryMax}
                                            onChange={handleInputChange}
                                            placeholder="Maximum Salary"
                                            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                        />
                                    </div>
                                    <div>
                                        <label 
                                            htmlFor="salaryMax" 
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Salery Currency
                                        </label>
                                        <select
                                            id="salaryCurrency"
                                            name="salaryCurrency"
                                            value={formData.salaryCurrency}
                                            onChange={handleInputChange}
                                            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                        >
                                            <option value="">Select Currency</option>
                                            <option value="$">USD</option>
                                            <option value="€">EUR</option>
                                            <option value="£">GBP</option>
                                            <option value="₹">INR</option>
                                            <option value="¥">JPY</option>
                                            <option value="₩">KRW</option>
                                            <option value="₽">RUB</option>
                                            <option value="C$">CAD</option>
                                            <option value="A$">AUD</option>
                                            <option value="CHF">CHF</option>
                                            <option value="HK$">HKD</option>
                                            <option value="SG$">SGD</option>
                                            <option value="NZ$">NZD</option>
                                            <option value="R$">BRL</option>
                                            <option value="ZAR">ZAR</option>
                                           
                                        </select>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                      
                                        <input
                                            id="isHideSalary"
                                            type="checkbox"
                                            checked={formData.isHideSalary}
                                            onChange={(e) => setFormData(prevState => ({ ...prevState, isHideSalary: e.target.checked }))}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="isHideSalary" className="text-sm font-medium text-gray-700">    
                                             Hide Salary 
                                            </label>
                                    </div>

                                </div>
                                {/* Job Skills - Multi-Select */}
                        <div>
                            <label 
                                htmlFor="jobSkills" 
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Job Skills
                            </label>
                            <Select
                                id="jobSkills"
                                name="jobSkills"
                                options={jobSkills}
                                value={formData.jobSkills}
                                onChange={handleChange('jobSkills')}
                                placeholder="Select Job Skills"
                                isMulti
                                isSearchable={true}
                            />
                        </div>
                            </div>

                            <div className="space-y-4">
                                {/* Qualifications - Multi-Select */}
                                <div>
                                    <label 
                                        htmlFor="qualification" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Qualifications
                                    </label>
                                    <Select
                                        id="qualification"
                                        name="qualification"
                                        options={qualifications}
                                        value={formData.qualification}
                                        onChange={handleChange('qualification')}
                                        placeholder="Select Qualifications"
                                        isMulti
                                        isSearchable={true}
                                    />
                                </div>

                                {/* Career Levels - Multi-Select */}
                                <div>
                                    <label 
                                        htmlFor="careerLevel" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Career Levels
                                    </label>
                                    <Select
                                        id="careerLevel"
                                        name="careerLevel"
                                        options={careerLevels}
                                        value={formData.careerLevel}
                                        onChange={handleChange('careerLevel')}
                                        placeholder="Select Career Levels"
                                        isMulti
                                        isSearchable={true}
                                    />
                                </div>

                                {/* Experience */}
                                <div>
                                    <label 
                                        htmlFor="experience" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Experience (Years)
                                    </label>
                                    <input
                                        id="experience"
                                        name="experience"
                                        type="number"
                                        value={formData.experience}
                                        onChange={handleInputChange}
                                        placeholder="Years of experience"
                                        className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                    />
                                </div>
                            </div>
                        </div>

                        
                    </div>

                    {/* Company & Media Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl border-b border-gray-300 pb-3">
                            Company & Media
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                {/* Company Name */}
                                <div>
                                    <label 
                                        htmlFor="companyName" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Company Name
                                    </label>
                                    <input
                                        id="companyName"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        placeholder="Enter company name"
                                        className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                    />
                                </div>

                                {/* Company Website */}
                                <div>
                                    <label 
                                        htmlFor="companyWebsite" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Company Website
                                    </label>
                                    <input
                                        id="companyWebsite"
                                        name="companyWebsite"
                                        value={formData.companyWebsite}
                                        onChange={handleInputChange}
                                        placeholder="Company website URL"
                                        className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Video URL */}
                                <div>
                                    <label 
                                        htmlFor="videoUrl" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Video URL
                                    </label>
                                    <input
                                        id="videoUrl"
                                        name="videoUrl"
                                        value={formData.videoUrl}
                                        onChange={handleInputChange}
                                        placeholder="Job or company video URL"
                                        className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                    />
                                </div>

                                {/* Video Image/Thumbnail */}
                               
                                <div>
                                    <label 
                                        htmlFor="videoImage" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Video Image/Thumbnail
                                    </label>
                                    
                                    <input
                                        id="videoImage"
                                        type="file"
                                        name="videoImage"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                    />
                                </div>
                                <div>
                                        {formData.videoImage && (
                                            <img
                                                src={typeof formData.videoImage === 'string' ? formData.videoImage : URL.createObjectURL(formData.videoImage)}
                                                alt="Current"
                                                className="w-32 h-32 object-cover border"
                                            />
                                        )}
                                    </div>
                            </div>
                        </div>
                    </div>

                    {/* SEO & Metadata Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl border-b border-gray-300 pb-3">
                            SEO & Metadata
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                {/* Focus Keyphrase */}
                                <div>
                                    <label 
                                        htmlFor="focusKeyphrase" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Focus Keyphrase
                                    </label>
                                    <input
                                        id="focusKeyphrase"
                                        name="focusKeyphrase"
                                        value={formData.focusKeyphrase}
                                        onChange={handleInputChange}
                                        placeholder="SEO focus keyword"
                                        className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                    />
                                </div>

                                {/* SEO Title */}
                                <div>
                                    <label 
                                        htmlFor="seoTitle" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        SEO Title
                                    </label>
                                    <input
                                        id="seoTitle"
                                        name="seoTitle"
                                        value={formData.seoTitle}
                                        onChange={handleInputChange}
                                        placeholder="SEO page title"
                                        className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Meta Description */}
                                <div>
                                    <label 
                                        htmlFor="metaDescription" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Meta Description
                                    </label>
                                    <textarea
                                        id="metaDescription"
                                        name="metaDescription"
                                        value={formData.metaDescription}
                                        onChange={handleInputChange}
                                        placeholder="Short meta description"
                                        rows={5}
                                        className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>


                     {/*  Additional Fields */}
                     <div className="space-y-6">
                        <h2 className="text-xl border-b border-gray-300 pb-3">
                        Additional Fields
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-8">
                                {/* Focus Keyphrase */}
                                <div>
                                    <label 
                                        htmlFor="certifications" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                      Certifications
                                    </label>
                                    <textarea
                                        id="certifications"
                                        name="certifications"
                                        value={formData.certifications}
                                        onChange={handleInputChange}
                                        placeholder="Short meta description"
                                        rows={3}
                                        className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                    />
                                </div>

                            </div>

                            <div className="space-y-8">
                                {/* Meta Description */}
                                <div>
                                    <label 
                                        htmlFor="jobSpecificDetails" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                       Job specific details
                                    </label>
                                    <textarea
                                        id="jobSpecificDetails"
                                        name="jobSpecificDetails"
                                        value={formData.jobSpecificDetails}
                                        onChange={handleInputChange}
                                        placeholder="Short meta description"
                                        rows={3}
                                        className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                                    />
                                </div>
                            </div>

                            {/* saveDraft */}
                            <div className="flex items-center space-x-4">
                                <input
                                    id="saveDraft"
                                    type="checkbox"
                                    checked={formData.saveDraft}
                                    onChange={(e) => setFormData(prevState => ({ ...prevState, saveDraft: e.target.checked }))}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="saveDraft" className="text-sm font-medium text-gray-700">
                                    Save as Draft
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t  border-gray-300">
                        <button
                            type="button"
                            onClick={() => router.push('/admin/jobs')}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            Submit Job Posting
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}