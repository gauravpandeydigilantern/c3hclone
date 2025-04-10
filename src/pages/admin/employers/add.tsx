import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

// Define proper types for the employer data based on the schema
interface EmployerData {
  name: string;
  email: string;
  password: string;
  role: string;
  country_code?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  company_name?: string;
  is_hiring_manager: boolean;
  officialEmail?: string;
  managerName?: string;
  managerEmail?: string;
  managerPhone?: string;
  companyName?: string;
  companyWebsite?: string;
  companySize?: number;
  Industry?: string;
  founded?: string;
  location?: string;
  billingCountry?: string;
  billingState?: string;
  billingCity?: string;
  billingZipcode?: string;
  billingAddress?: string;
  billingApartmentSuite?: string;
  isFeatured: boolean;
  status: boolean;
}

export default function AddEmployer() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // For tab navigation
  const router = useRouter();
  
  // Initialize with all schema fields
  const [industries, setIndustries] = useState<{ industry_id: string; name: string }[]>([]);
  const [employer, setEmployer] = useState<EmployerData>({
    name: "",
    email: "",
    password: "",
    role: "employer",
    country_code: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    company_name: "",
    is_hiring_manager: false,
    officialEmail: "",
    managerName: "",
    managerEmail: "",
    managerPhone: "",
    companyName: "",
    companyWebsite: "",
    companySize: undefined,
    Industry: "",
    founded: "",
    location: "",
    billingCountry: "",
    billingState: "",
    billingCity: "",
    billingZipcode: "",
    billingAddress: "",
    billingApartmentSuite: "",
    isFeatured: false,
    status: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const tokenData = localStorage.getItem("token");
    if (!tokenData) {
      router.push("/admin/login");
    } else {
      try {
        const { expiresAt } = JSON.parse(tokenData);
        if (new Date().getTime() > expiresAt) {
          localStorage.removeItem("token");
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Invalid token format", error);
        localStorage.removeItem("token");
        router.push("/admin/login");
      }
    }
  }, [router]);
  
  // industry fectch
  useEffect(() => {
    const fetchIndustries = async () => {
      const tokenData = localStorage.getItem("token");
      if (!tokenData) {
        router.push("/admin/login");
        return;
      }
      const { token } = JSON.parse(tokenData);
      // TODO: Fetch industry data from API
      const response = await fetch("/api/industry",
        {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
      );
      const data = await response.json();
      setIndustries(data);
    };
    fetchIndustries();
    }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!employer.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!employer.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(employer.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!employer.password) {
      newErrors.password = "Password is required";
    } else if (employer.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    // Optional fields validation
    if (employer.phone && !/^\d{10,14}$/.test(employer.phone)) {
      newErrors.phone = "Phone number must be between 10-14 digits";
    }
    
    if (employer.managerEmail && !/\S+@\S+\.\S+/.test(employer.managerEmail)) {
      newErrors.managerEmail = "Manager email is invalid";
    }
    
    if (employer.officialEmail && !/\S+@\S+\.\S+/.test(employer.officialEmail)) {
      newErrors.officialEmail = "Official email is invalid";
    }
    
    if (employer.companySize && isNaN(Number(employer.companySize))) {
      newErrors.companySize = "Company size must be a number";
    }
    
    if (employer.Industry && isNaN(Number(employer.Industry))) {
      newErrors.Industry = "Industry must be a number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEmployer(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'companySize' || name === 'Industry') {
      // Convert to number if needed
      const numValue = value === '' ? undefined : Number(value);
      setEmployer(prev => ({ ...prev, [name]: numValue }));
    } else {
      setEmployer(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tokenData = localStorage.getItem("token");
      if (!tokenData) {
        router.push("/admin/login");
        return;
      }

      const { token } = JSON.parse(tokenData);
      
      const response = await fetch("/api/employers", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(employer),
      });

      if (response.ok) {
        router.push("/admin/employers");
      } else {
        const result = await response.json();
        setSubmitError(result.message || "Failed to add employer. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!isClient) return null;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Add New Employer</h1>
        <button
          onClick={handleGoBack}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
          type="button"
        >
          Back
        </button>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 mb-4 p-3 rounded text-red-700">
          {submitError}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'basic' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('basic')}
            >
              Basic Information
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'company' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('company')}
            >
              Company Details
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'manager' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('manager')}
            >
              Manager Information
            </button>
          </li>
          <li>
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'billing' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('billing')}
            >
              Billing Information
            </button>
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Tab */}
        <div className={activeTab === 'basic' ? 'block' : 'hidden'}>
          <h2 className="text-lg font-medium mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="w-full">
              <label className="block mb-1 font-medium">Name*</label>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={employer.name}
                onChange={handleChange}
                className={`bg-white block w-full p-2 border ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="w-full">
              <label className="block mb-1 font-medium">Email*</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={employer.email}
                onChange={handleChange}
                className={`bg-white block w-full p-2 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            <div className="w-full">
              <label className="block mb-1 font-medium">Password*</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={employer.password}
                onChange={handleChange}
                className={`bg-white block w-full p-2 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="w-full hidden">
              <label className="block mb-1 font-medium">Official Email</label>
              <input
                type="email"
                name="officialEmail"
                placeholder="Official Email"
                value={employer.officialEmail || ''}
                onChange={handleChange}
                className={`bg-white block w-full p-2 border ${
                  errors.officialEmail ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900`}
              />
              {errors.officialEmail && <p className="text-red-500 text-sm mt-1">{errors.officialEmail}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
            <div className="w-full">
              <label className="block mb-1 font-medium">Country Code</label>
              <input
                type="text"
                name="country_code"
                placeholder="Country Code (e.g., +1)"
                value={employer.country_code || ''}
                onChange={handleChange}
                className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div className="w-full">
              <label className="block mb-1 font-medium">Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={employer.phone || ''}
                onChange={(e) => {
                  const phoneValue = e.target.value;
                  if (/^\d*$/.test(phoneValue)) {
                    setEmployer(prev => ({ ...prev, phone: phoneValue }));
                  }
                }}
                className={`bg-white block w-full p-2 border ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div className="w-full">
              <label className="block mb-1 font-medium">Location</label>
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={employer.location || ''}
                onChange={handleChange}
                className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
            <div className="w-full">
              <label className="block mb-1 font-medium">Country</label>
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={employer.country || ''}
                onChange={handleChange}
                className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div className="w-full">
              <label className="block mb-1 font-medium">State</label>
              <input
                type="text"
                name="state"
                placeholder="State"
                value={employer.state || ''}
                onChange={handleChange}
                className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div className="w-full">
              <label className="block mb-1 font-medium">City</label>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={employer.city || ''}
                onChange={handleChange}
                className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="status"
                name="status"
                checked={employer.status}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="status" className="ml-2 block text-sm text-gray-900">
                Active Status
              </label>
            </div>
          </div>
        </div>

        {/* Company Details Tab */}
        <div className={activeTab === 'company' ? 'block' : 'hidden'}>
          <h2 className="text-lg font-medium mb-4">Company Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="w-full">
              <label className="block mb-1 font-medium">Company Name</label>
              <input
                type="text"
                name="company_name"
                placeholder="Company Name"
                value={employer.company_name || ''}
                onChange={handleChange}
                className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div className="w-full">
              <label className="block mb-1 font-medium">Company Website</label>
              <input
                type="text"
                name="companyWebsite"
                placeholder="Company Website"
                value={employer.companyWebsite || ''}
                onChange={handleChange}
                className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
            <div className="w-full">
              <label className="block mb-1 font-medium">Company Size</label>
              <input
                type="number"
                name="companySize"
                placeholder="Number of Employees"
                value={employer.companySize === undefined ? '' : employer.companySize}
                onChange={handleChange}
                className={`bg-white block w-full p-2 border ${
                  errors.companySize ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900`}
              />
              {errors.companySize && <p className="text-red-500 text-sm mt-1">{errors.companySize}</p>}
            </div>

            <div className="w-full">
              <label className="block mb-1 font-medium">Industry</label>
              <select
                name="Industry"
                value={employer.Industry}
                onChange={handleChange}
                className={`bg-white block w-full p-2 border ${
                  errors.Industry ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900`}

              >
                <option value="">Select Industry</option>
                {/* Assuming industries is an array of objects with id and name properties */}
                {industries.length > 0 &&
                industries.map((industry) => (
                  <option key={industry.industry_id} value={industry.industry_id}>
                    {industry.name}
                  </option>
                ))}
                </select>
             
              {errors.Industry && <p className="text-red-500 text-sm mt-1">{errors.Industry}</p>}
            </div>

            <div className="w-full">
              <label className="block mb-1 font-medium">Founded Year</label>
              <input
                type="text"
                name="founded"
                placeholder="Founded Year"
                value={employer.founded || ''}
                onChange={handleChange}
                className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={employer.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                Featured Employer
              </label>
            </div>
          </div>
        </div>

        {/* Manager Information Tab */}
        <div className={activeTab === 'manager' ? 'block' : 'hidden'}>
          <h2 className="text-lg font-medium mb-4">Manager Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="w-full">
              <label className="block mb-1 font-medium">Manager Name</label>
              <input
                type="text"
                name="managerName"
                placeholder="Manager Name"
                value={employer.managerName || ''}
                onChange={handleChange}
                className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div className="w-full">
              <label className="block mb-1 font-medium">Manager Email</label>
              <input
                type="email"
                name="managerEmail"
                placeholder="Manager Email"
                value={employer.managerEmail || ''}
                onChange={handleChange}
                className={`bg-white block w-full p-2 border ${
                  errors.managerEmail ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900`}
              />
              {errors.managerEmail && <p className="text-red-500 text-sm mt-1">{errors.managerEmail}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            <div className="w-full">
              <label className="block mb-1 font-medium">Manager Phone</label>
              <input
                type="text"
                name="managerPhone"
                placeholder="Manager Phone"
                value={employer.managerPhone || ''}
                onChange={handleChange}
                className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div className="w-full">
              <div className="flex items-center mt-8">
                <input
                  type="checkbox"
                  id="is_hiring_manager"
                  name="is_hiring_manager"
                  checked={employer.is_hiring_manager}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_hiring_manager" className="ml-2 block text-sm text-gray-900">
                  Is Hiring Manager
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Information Tab */}
        <div className={activeTab === 'billing' ? 'block' : 'hidden'}>
          <h2 className="text-lg font-medium mb-4">Billing Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="w-full">
              <label className="block mb-1 font-medium">Billing Country</label>
              <input
                type="text"
                name="billingCountry"
                placeholder="Billing Country"
                value={employer.billingCountry || ''}
                onChange={handleChange}
                className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div className="w-full">
              <label className="block mb-1 font-medium">Billing State</label>
              <input
                type="text"
                name="billingState"
                placeholder="Billing State"
                value={employer.billingState || ''}
                onChange={handleChange}
                className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div className="w-full">
              <label className="block mb-1 font-medium">Billing City</label>
              <input
                type="text"
                name="billingCity"
                placeholder="Billing City"
                value={employer.billingCity || ''}
                onChange={handleChange}
                className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            <div className="w-full">
              <label className="block mb-1 font-medium">Billing Zipcode</label>
              <input
                type="text"
                name="billingZipcode"
                placeholder="Billing Zipcode"
                value={employer.billingZipcode || ''}
                onChange={handleChange}
                className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div className="w-full">
              <label className="block mb-1 font-medium">Billing Address</label>
              <input
                type="text"
                name="billingAddress"
                placeholder="Billing Address"
                value={employer.billingAddress || ''}
                onChange={handleChange}
                className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full">
              <label className="block mb-1 font-medium">Apartment/Suite</label>
              <input
                type="text"
                name="billingApartmentSuite"
                placeholder="Apartment or Suite Number"
                value={employer.billingApartmentSuite || ''}
                onChange={handleChange}
                className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>
          </div>
        </div>

        <div className="w-full text-right mt-8 pt-4 border-t border-gray-200">
          {activeTab !== 'basic' && (
            <button
              type="button"
              onClick={() => {
                const tabs = ['basic', 'company', 'manager', 'billing'];
                const currentIndex = tabs.indexOf(activeTab);
                if (currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1]);
                }
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2 transition-colors"
            >
              Previous
            </button>
          )}
          
          {activeTab !== 'billing' ? (
            <button
              type="button"
              onClick={() => {
                const tabs = ['basic', 'company', 'manager', 'billing'];
                const currentIndex = tabs.indexOf(activeTab);
                if (currentIndex < tabs.length - 1) {
                  setActiveTab(tabs[currentIndex + 1]);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Next
            </button>
          ) : (
            <button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition-colors disabled:bg-green-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Save Employer"}
            </button>
          )}
        </div>
      </form>
    </Layout>
  );
}