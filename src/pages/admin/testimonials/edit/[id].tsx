import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import Link from "next/link";

export default function EditTestimonial() {
  const router = useRouter();
  const { id } = router.query; // Get testimonial ID from URL
  
  const [testimonial, setTestimonial] = useState({
    name: "",
    position: "",
    description: "",
    image: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch existing testimonial data
  useEffect(() => {
    if (id) {
      fetch(`/api/testimonials/${id}`)
        .then((res) => res.json())
        .then((data) => setTestimonial(data))
        .catch((err) => console.error("Error fetching testimonial:", err));
    }
  }, [id]);

  useEffect(() => {
    // If there is an image from the API, set it as the image preview
    if (testimonial.image) {
      setImagePreview(testimonial.image);
    }
  }, [testimonial.image]);

  const handleChange = (e: any) => {
    setTestimonial({ ...testimonial, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    // Create a preview URL for the selected image
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Set the preview URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", testimonial.name);
    formData.append("position", testimonial.position);
    formData.append("description", testimonial.description);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    const response = await fetch(`/api/testimonials/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (response.ok) {
      router.push("/admin/testimonials");
    } else {
      console.error("Failed to update testimonial");
    }
    setLoading(false);
  };

  const handleGoBack = () => {
    router.back(); // Go back to the previous page
  };
  return (
    <Layout>
      <div>
      <div className="flex justify-between items-center mb-4">
        
        <h1 className="text-2xl">Edit Testimonial</h1>
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
        <label className="block mb-1">Name</label>
          <input type="text" name="name" value={testimonial.name} onChange={handleChange} placeholder="Name" className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" />
          </div>
          <div className="w-full">
          <label className="block mb-1">Position</label>
          <input type="text" name="position" value={testimonial.position} onChange={handleChange} placeholder="Position" className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" />
        </div>
        </div>
        <div className="w-full">
        <label className="block mb-1">Description</label>
          <textarea name="description" value={testimonial.description} onChange={handleChange} placeholder="Description" className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" />
          </div>
          <div>
          <div className="w-full">
          <label className="block mb-1">Image</label>
          <div className="align-middle inline-block mr-3 bg-white w-18 h-18 object-cover border border-gray-200 p-1">
            {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Selected preview"
                  className="w-full"
                />
              )}
          </div>
          
          <input type="file" accept="image/*" onChange={handleFileChange} className="bg-white inline-block w-1/4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" />
</div>
</div>
<div className="w-full text-right">
          <button type="submit" className="btn-primary px-4 py-2 rounded" disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
