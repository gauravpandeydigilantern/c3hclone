import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function AddPackage() {
  const [isClient, setIsClient] = useState(false); // Ensures rendering only on the client
  const router = useRouter();
  const [formData, setFormData] = useState({
    package_name: "",
    description: "",
    max_job_posts: "",
    max_portfolio: "",
    price: "",
    is_premium: false,
  });

  const handleChange = (e:any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
     // Custom validation to allow only numbers for max_job_posts
  if (name === "max_job_posts" && !/^\d*$/.test(value)) {
    // If the value is not a number, do not update the state.
    return;
  }
  };

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    router.push("/admin/packages");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
   <Layout>
     <div>
     <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Add Package</h1>
          <button
            onClick={handleGoBack} 
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Back
        </button>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4">
<div className="flex gap-5">
      <div className="w-full">
      <label className="block mb-1">Package Name</label>
        <input type="text" name="package_name" placeholder="Package Name" required className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" onChange={handleChange} />
        </div>

        <div className="w-full">
        <label className="block mb-1">Max Job Posts</label>
        <input type="number" name="max_job_posts" placeholder="Max Job Posts" required className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" onChange={handleChange} />
        </div>
        </div>
<div className="flex gap-5">
        <div className="w-full">
        <label className="block mb-1">Max Portfolio</label>
        <input type="number" name="max_portfolio" placeholder="Max Portfolio" required className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" onChange={handleChange} />
        </div>
        <div className="w-full">
        <label className="block mb-1">Price</label>
        <input type="number" name="price" placeholder="Price" required className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" onChange={handleChange} />
        </div>
</div>
<div className="flex gap-5">
        <div className="w-full">
        <label className="flex items-center">
          <input type="checkbox" name="is_premium" onChange={handleChange} /> <span className="ml-2">Premium Package</span>
        </label>
       </div>
       </div>
       <div className="flex gap-5">
       <div className="w-full">
       <label className="block mb-1">Description</label>
        <textarea name="description" placeholder="Description" className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" onChange={handleChange}></textarea>
        </div>
        </div>
        <div className="w-full text-right">
        <button type="submit" className="btn-primary px-4 py-2 rounded">Submit</button>
        </div>
      </form>
    </div>
   </Layout>
  );
}
