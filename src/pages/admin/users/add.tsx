import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

// Define the user type for TypeScript
interface User {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  profile_image: File | null;
}

export default function AddUser() {
  const [isClient, setIsClient] = useState(false); // Ensures rendering only on the client
  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    profile_image: null,
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const validateToken = (): boolean => {
    const tokenData = localStorage.getItem("token");
    if (!tokenData) {
      router.push("/admin/login");
      return false;
    }
    const { expiresAt } = JSON.parse(tokenData);
    if (new Date().getTime() > expiresAt) {
      localStorage.removeItem("token");
      router.push("/admin/login");
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!validateToken()) return;
    setIsClient(true); // Set to true after validation
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true); // Start loading state

    // Simple client-side validation
    if (!user.name || !user.email || !user.password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", user.name);
    formData.append("email", user.email);
    formData.append("phone", user.phone); 
    formData.append("password", user.password);
    formData.append("role", user.role);
    if (user.profile_image) {
      formData.append("profile_image", user.profile_image);
    }

    const tokenData = localStorage.getItem("token");
    const { token } = JSON.parse(tokenData || '{}');
    
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        router.push("/admin/users");
      } else {
        const result = await response.json();
        setError(result.message || "Something went wrong.");
      }
    } catch (error) {
      setError("An error occurred while submitting the form.");
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  const handleGoBack = () => {
    router.back(); // Go back to the previous page
  };

  if (!isClient) return null; // Prevent hydration mismatch

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Add New User</h1>
        <button
          onClick={handleGoBack}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Back
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

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
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            />
          </div>
          <div className="w-full">
            <label className="block mb-1">Phone</label>
            <input
              type="phone"
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

        <div className="flex gap-5">
          <div className="w-1/2">
            <label className="block mb-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            />
          </div>
          <div className="w-1/2">
            <label className="block mb-1">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setUser({ ...user, profile_image: e.target.files ? e.target.files[0] : null })}
              className="bg-white block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
            />
          </div>
        </div>

        <div className="w-full text-right">
          <button
            type="submit"
            className={`btn-primary px-4 py-2 rounded ${loading ? "bg-gray-300 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </Layout>
  );
}
