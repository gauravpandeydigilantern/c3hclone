import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function AddService() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    // base_price: "ASDSC",
    description: "",
  });

  const [image, setImage] = useState<File | null>(null);
  // const [workVideo, setWorkVideo] = useState<File | null>(null);

  const handleChange = (e: any) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      if (name === "image") {
        setImage(files[0]);
      } 
      // else if (name === "work_video") {
      //   setWorkVideo(files[0]);
      // }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const form = new FormData();
    form.append("name", formData.name);
    // form.append("base_price", formData.base_price);
    // form.append("work_video", workVideo || "");
    form.append("description", formData.description);

    if (image) {
      form.append("image", image); // append file here
    }

    const response =  await fetch("/api/services", {
      method: "POST",
      body: form, // send the FormData directly
    });
    if (response.ok) {
      router.push("/admin/services");
    }
  };
  const handleGoBack = () => {
    router.back();
  };

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Add Service</h1>
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
            placeholder="Service Name"
            required
            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            onChange={handleChange}
          />
</div>
          {/* <div className="w-full">
          <label className="block mb-1">Base Price</label>
          <input
            type="number"
            name="base_price"
            placeholder="Base Price"
            required
            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            onChange={handleChange}
          />
        </div> */}
</div>
<div className="flex gap-5">
  <div className="w-1/2">
  <label className="block mb-1">Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
          />
          </div>
          {/* <div className="w-1/2">
          <label className="block mb-1">Work Video</label>
          <input
            type="file"
            name="work_video"
            accept="video/*"
            onChange={handleChange}
            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
          />
          </div> */}
</div>
<label className="block mb-1">Description</label>
          <textarea
            name="description"
            placeholder="Description"
            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            onChange={handleChange}
          ></textarea>
          <div className="w-full text-right">
          <button type="submit" className="btn-primary px-4 py-2 rounded">Submit</button>
  </div>
        </form>
      </div>
    </Layout>
  );
}
