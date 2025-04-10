import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function SiteManagement() {
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    facebook: "",
    instagram: "",
    xLink: "",
    email: "",
    banner: "null",
    phone: "",
    logo: null,
    address: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    facebook: "",
    instagram: "",
    xLink: "",
    email: "",
    banner: "",
    phone: "",
    logo: "",
    address: "",
    description: "",
  });

  const router = useRouter();

  useEffect(() => {
    setIsClient(true); // Safe to access localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/admin/login"); // Redirect if no token
    }
  }, [router]);

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
      return;
    }
    fetch(`/api/site-management`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res: Response) => {
        if (res.status === 401) {
          localStorage.removeItem("token"); // Handle unauthorized access
          router.push("/admin/login");
          throw new Error("Unauthorized, redirecting to login...");
        }
        return res.json();
      })
      .then((data: any) => {
        setFormData({
          name: data.data.name || "",
          facebook: data.data.facebook || "",
          description: data.data.description || "",
          instagram: data.data.instagram || "",
          xLink: data.data.xLink || "",
          email: data.data.email || "",
          address: data.data.address || "",
          phone: data.data.phone || "",
          banner: data.data.banner,
          logo: data.data.logo,
        });
      })
      .catch((err: any) => console.error("Error fetching site data:", err));
  }, []);

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value, // Handle file inputs
    }));
  };

  const validateForm = () => {
    let formErrors: any = {};
    let isValid = true;

    // Check for required fields
    if (!formData.name) {
      formErrors.name = "Title is required";
      isValid = false;
    }

    if (!formData.facebook) {
      formErrors.facebook = "Facebook link is required";
      isValid = false;
    }

    if (!formData.instagram) {
      formErrors.instagram = "Instagram link is required";
      isValid = false;
    }

    if (!formData.xLink) {
      formErrors.xLink = "X link is required";
      isValid = false;
    }

    if (!formData.email) {
      formErrors.email = "Email is required";
      isValid = false;
    }

    // if (formData.banner && !formData.banner.type.startsWith("image")) {
    //   formErrors.banner = "Please upload a valid image file for the banner";
    //   isValid = false;
    // }

    // if (formData.logo && !formData.logo.type.startsWith("image")) {
    //   formErrors.logo = "Please upload a valid image file for the logo";
    //   isValid = false;
    // }

    if (!formData.phone) {
      formErrors.phone = "Phone number is required";
      isValid = false;
    }

    if (!formData.address) {
      formErrors.address = "Address is required";
      isValid = false;
    }

    if (!formData.description) {
      formErrors.description = "Description is required";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const tokenData = localStorage.getItem("token");
    if (!tokenData) {
      router.push("/admin/login");
      return;
    }

    const { token, expiresAt } = JSON.parse(tokenData);
    if (new Date().getTime() > expiresAt) {
      localStorage.removeItem("token");
      router.push("/admin/login");
      return;
    }
    // Validate the form before sending
    if (!validateForm()) {
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("facebook", formData.facebook);
      formDataToSend.append("instagram", formData.instagram);
      formDataToSend.append("xLink", formData.xLink);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("description", formData.description);

      if (formData.banner) {
        formDataToSend.append("banner", formData.banner);
      }
      if (formData.logo) {
        formDataToSend.append("logo", formData.logo);
      }

      const response = await fetch("/api/site-management", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Site data saved:", result);
        // Handle success (e.g., show a success message)
      } else {
        console.error("Failed to save site data:", result);
        // Handle failure (e.g., show an error message)
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle network or other errors
    }
  };

  if (!isClient) return null; // Prevent hydration mismatch

  return (
    <Layout>
      <h1 className="text-2xl mb-4">Site Management</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
<div className="flex gap-5">
      <div className="w-full">
          <label htmlFor="name" className="block mb-1">
            Title
          </label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Title"
            required
            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div className="w-full">
          <label htmlFor="facebook" className="block mb-1">
            Facebook link
          </label>
          <input
            type="text"
            name="facebook"
            id="facebook"
            placeholder="Facebook link"
            required
            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            value={formData.facebook}
            onChange={handleChange}
          />
          {errors.facebook && <p className="text-red-500 text-sm">{errors.facebook}</p>}
        </div>
</div>
<div className="flex gap-5">
      <div className="w-full">
          <label htmlFor="instagram" className="block mb-1">
            Instagram link
          </label>
          <input
            type="text"
            name="instagram"
            id="instagram"
            placeholder="Instagram link"
            required
            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            value={formData.instagram}
            onChange={handleChange}
          />
          {errors.instagram && <p className="text-red-500 text-sm">{errors.instagram}</p>}
        </div>

        <div className="w-full">
          <label htmlFor="xLink" className="block mb-1">
            X link
          </label>
          <input
            type="text"
            name="xLink"
            id="xLink"
            placeholder="X link"
            required
            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            value={formData.xLink}
            onChange={handleChange}
          />
          {errors.xLink && <p className="text-red-500 text-sm">{errors.xLink}</p>}
        </div>
</div>
<div className="flex gap-5">
      <div className="w-full">
          <label htmlFor="email" className="block mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            required
            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div className="w-full flex">
       <div className="w-full">
          <label htmlFor="banner" className="block mb-1">
            Banner Image
          </label>
          <input
            type="file"
            name="banner"
            id="banner"
            accept="image/*"
            onChange={handleChange}
            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
          />
</div>

<div className="w-full">
          {formData.banner && (
            <img
              src={formData.banner}
              alt="Current banner"
              className="w-16 h-15 object-cover border border-gray-300 ml-3"
            />
          )}
          {errors.banner && <p className="text-red-500 text-sm">{errors.banner}</p>}
          </div>          
        </div>
</div>

<div className="flex gap-5">
      <div className="w-full">
          <label htmlFor="phone" className="block mb-1">
            Phone Number
          </label>
          <input
            type="text"
            name="phone"
            id="phone"
            placeholder="Phone Number"
            required
            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>

        <div className="w-full flex">
        <div className="w-full">
          <label htmlFor="logo" className="block mb-1">
            Logo Image
          </label>
          <input
            type="file"
            name="logo"
            id="logo"
            accept="image/*"
            onChange={handleChange}
            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
          />
          </div>
          <div className="w-full">
          {formData.logo && (
            <img
              src={formData.logo}
              alt="Current logo"
              className="w-16 h-15 object-contain border border-gray-300 ml-3"
            />
          )}
          {errors.logo && <p className="text-red-500 text-sm">{errors.logo}</p>}
          </div>
      </div>
</div>
<div className="flex gap-5">
      <div className="w-full">
          <label htmlFor="address" className="block mb-1">
            Address
          </label>
          <textarea
            name="address"
            id="address"
            placeholder="Address"
            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            value={formData.address}
            onChange={handleChange}
          ></textarea>
          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
        </div>

        <div className="w-full">
          <label htmlFor="description" className="block mb-1">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            placeholder="Description"
            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
        </div>
</div>
<div className="w-full text-right">
        <button type="submit" className="btn-primary px-4 py-2 rounded">
          Submit
        </button>
  </div>
      </form>
    </Layout>
  );
}
