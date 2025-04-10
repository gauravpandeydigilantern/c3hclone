import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";

export default function EditService() {
  const router = useRouter();
  const { id } = router.query;

  const [imageFile, setImageFile] = useState<File | null>(null);
  // const [videoFile, setVideoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    // base_price: "",
    description: "",
    image: "",
    // work_video: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    base_price: "",
    description: "",
    image: "",
    work_video: "",
  });

  useEffect(() => {
    if (id) {
      fetch(`/api/services/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            name: data.name,
            // base_price: data.base_price,
            description: data.description,
            image: data.image || "",
            // work_video: data.work_video || "",
          });
        })
        .catch((err) => console.error("Error fetching service:", err));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      if (name === "image") setImageFile(files[0]);
      // if (name === "work_video") setVideoFile(files[0]);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    // if (!formData.base_price) newErrors.base_price = "Base price is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const form = new FormData();
    form.append("name", formData.name);
    // form.append("base_price", formData.base_price);
    form.append("description", formData.description);

    if (imageFile) form.append("image", imageFile);
    // if (videoFile) form.append("work_video", videoFile);

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        body: form,
      });

      if (!response.ok) {
        throw new Error("Failed to update service");
      }

      router.push("/admin/services");
    } catch (error) {
      console.error("Error updating service:", error);
    }
  };

  if (!id) return <p>Loading...</p>;

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Layout>
      <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Edit Service</h1>
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
            <label className="block mb-1">Service Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
             className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              onChange={handleChange}
              required
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* <div className="w-full">
            <label className="block mb-1">Base Price</label>
            <input
              type="number"
              name="base_price"
              value={formData.base_price}
              className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              onChange={handleChange}
              required
            />
            {errors.base_price && <p className="text-red-500 text-sm">{errors.base_price}</p>}
          </div> */}
          </div>
          <div className="flex gap-5">
          <div className="w-full">
            <label className="block mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              onChange={handleChange}
              required
            ></textarea>
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>
        </div>
        <div className="flex gap-5">
          <div className="w-full">
            <label className="block mb-1">Image</label>
            <div className="inline-block mr-3 align-top">
            <input
              type="file"
              name="image"
              accept="image/*"
              className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              onChange={handleFileChange}
            />
            </div>
            {formData.image && (
              <img src={formData.image} alt="Current" className="w-26 h-26 bg-white p-1 object-cover border border-gray-300" />
            )}
            {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
           
          </div>

            {/* <div className="w-full">
            <label className="block mb-1">Work Video</label>
            <div className="inline-block mr-3 align-top">
            <input
              type="file"
              name="work_video"
              accept="video/*"
             className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              onChange={handleFileChange}
            />
            </div>
            {errors.work_video && <p className="text-red-500 text-sm">{errors.work_video}</p>}
            <div className="inline-block mr-3 align-top">
            {formData.work_video && (
              <video controls className="w-64 h-32 object-cover border">
                <source src={formData.work_video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          </div> */}
          
</div>
<div className="w-full text-right">
          <button type="submit" className="btn-primary px-4 py-2 rounded">
            Update
          </button>
  </div>
        </form>
      </div>
    </Layout>
  );
}
