import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function AddTestimonial() {
  const router = useRouter();
  const [testimonial, setTestimonial] = useState({
    name: "",
    position: "",
    description: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);

      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Set the preview URL
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("name", testimonial.name);
    formData.append("position", testimonial.position);
    formData.append("description", testimonial.description);
    if (image) {
      formData.append("image", image);
    }

    const response = await fetch("/api/testimonials", {
      method: "POST",
      body: formData, // Sending FormData
    });

    if (response.ok) {
      router.push("/admin/testimonials");
    }
  };
  const handleGoBack = () => {
    router.back(); // Go back to the previous page
  };

  return (
    <Layout>
      <div>
      <div className="flex justify-between items-center mb-4">
        
        <h1 className="text-2xl">Add Testimonial</h1>
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
          <input type="text" placeholder="Name" value={testimonial.name} onChange={(e) => setTestimonial({ ...testimonial, name: e.target.value })} className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" />
          </div>
        <div className="w-full">
          <label className="block mb-1">Position</label>
          <input type="text" placeholder="Position" value={testimonial.position} onChange={(e) => setTestimonial({ ...testimonial, position: e.target.value })} className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" />
</div>
</div>
<div className="w-full">
          <label className="block mb-1">Description</label>
          <textarea placeholder="Description" value={testimonial.description} onChange={(e) => setTestimonial({ ...testimonial, description: e.target.value })} className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" />
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
          <input type="file" accept="image/*" onChange={handleFileChange} className="bg-white inline-block w-1/4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900" required />
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
