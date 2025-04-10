import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";

export default function EditPackage() {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/packages/${id}`)
        .then((res) => res.json())
        .then((data) => setFormData(data));
    }
  }, [id]);

  const handleChange = (e:any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev:any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    await fetch(`/api/packages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    router.push("/admin/packages");
  };

  if (!formData) return <p>Loading...</p>;

  const handleGoBack = () => {
    router.back(); // Go back to the previous page
  };
  
  return (
    <Layout>
        <div>
        <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Edit Package</h1>
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
        <input type="text" name="package_name" placeholder="Package Name" value={formData.package_name} required onChange={handleChange} className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" />
        </div>
        <div className="w-full">
        <label className="block mb-1">Max Job Posts</label>
        <input type="number" name="max_job_posts" placeholder="Max Job Posts" value={formData.max_job_posts} required onChange={handleChange}className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" />
        </div>
        </div>
<div className="flex gap-5">
<div className="w-full">
        <label className="block mb-1">Max Portfolio</label>
        <input type="number" name="max_portfolio" placeholder="Max Portfolio" value={formData.max_portfolio} required className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" onChange={handleChange} />
        </div>
        <div className="w-full">
        <label className="block mb-1">Price</label>
        <input type="number" name="price" placeholder="Price" value={formData.price} required  onChange={handleChange} className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" />
        </div>
        
        </div>
        <div className="w-full">
        <label className="flex items-center">
        <input
            type="checkbox"
            name="is_premium"
            onChange={handleChange}
            checked={formData.is_premium ? true : false} // This will check the checkbox if price exists
            />
            <span className="ml-2">Premium Package</span>
        </label>
        </div>
        <div className="w-full">
        <label className="block mb-1">Description</label>
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"></textarea>
        </div>
        <div className="w-full text-right">
        <button type="submit" className="btn-primary px-4 py-2 rounded">Update</button>
        </div>
      </form>
    </div>
    </Layout>
  );
}
