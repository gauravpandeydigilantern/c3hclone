import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function EditUser() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState({ name: "", email: "", phone: "", profile_image: "" });
  const [profile_image, setProfileImage] = useState<File | null>(null);

  useEffect(() => {
    const tokenData = localStorage.getItem("token");
    if (!tokenData) {
      router.push("/admin/login");
      return;
    }

    const { expiresAt } = JSON.parse(tokenData);
    if (new Date().getTime() > expiresAt) {
      localStorage.removeItem("token");
      router.push("/admin/login");
      return;
    }
  },  [id]);

  useEffect(() => {
    const tokenData = localStorage.getItem("token");
    const { token } = JSON.parse(tokenData || '{}');
    if (id) {
      fetch(`/api/users/${id}`, {
        method: "GET",
        
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          setProfileImage(null); // Reset any new image if data fetched
        });
    }
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const tokenData = localStorage.getItem("token");
    const { token } = JSON.parse(tokenData || '{}');
    
    const formData = new FormData();
    formData.append("name", user.name);
    formData.append("email", user.email);
    formData.append("phone", user.phone);

    if (profile_image) {
      formData.append("profile_image", profile_image); // Add the new profile image
    }

    const response = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
      body: formData,
    });

    if (response.ok) {
      router.push("/admin/users");
    } else {
      const result = await response.json();
      console.log(result.message || "Something went wrong.");
    }
  };

  const handleGoBack = () => {
    router.back(); // Go back to the previous page
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Edit User</h1>
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
            <input
              type="text"
              placeholder="Name"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            />
          </div>

          <div className="w-full">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={user.email}
              disabled
              className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            />
          </div>
        </div>

        <div className="flex gap-5">
          <div className="w-full">
            <label className="block mb-1">Phone</label>
            <input
              type="text"
              placeholder="Phone"
              value={user.phone}
              maxLength={14}
              onChange={(e) => {
                const phoneValue = e.target.value;
                if (/^\d*$/.test(phoneValue) && phoneValue.length <= 14) {
                  setUser({ ...user, phone: phoneValue });
                }
              }}
              className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            />
          </div>
        </div>

        <div className="w-full">
          <label className="block mb-1">Profile Image</label>
          {user.profile_image && (
            <div className="mb-2">
              <img
                src={user.profile_image}
                alt="Profile"
                className="w-32 h-32 object-cover rounded-md"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImage(e.target.files ? e.target.files[0] : null)}
            className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
          />
          
        </div>

        <div className="w-full text-right">
          <button type="submit" className="btn-primary px-4 py-2 rounded">
            Update
          </button>
        </div>
      </form>
    </Layout>
  );
}
