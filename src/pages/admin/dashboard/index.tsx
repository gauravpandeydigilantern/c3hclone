import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Head from "next/head";
import { FaUsers } from "react-icons/fa6";
import { LuListChecks } from "react-icons/lu";
import { FaUsersGear } from "react-icons/fa6";

export default function Dashboard() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false); // Ensures rendering only on the client
  const router = useRouter();

  useEffect(() => {
    setIsClient(true); // Ensure it's safe to access localStorage
  
    const tokenData = localStorage.getItem("token");
    if (!tokenData) {
      router.push("/admin/login");
      return;
    }
  
    const { token, expiresAt } = JSON.parse(tokenData);
  
    if (new Date().getTime() > expiresAt) {
      localStorage.removeItem("token"); // Remove expired token
      router.push("/admin/login");
    } else {
      fetchAdmins(); // Proceed if token is valid
    }
  }, []);
  

  const fetchAdmins = async () => {
    try {
      const tokenData = localStorage.getItem("token");
  
      if (!tokenData) {
        router.push("/admin/login");
        return;
      }
  
      const { token, expiresAt } = JSON.parse(tokenData);
  
      if (new Date().getTime() > expiresAt) {
        localStorage.removeItem("token"); // Remove expired token
        router.push("/admin/login");
        return;
      }
  
      const response = await fetch("/api/admin", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []); // Ensure it's an array
      } else if (response.status === 401) {
        localStorage.removeItem("token"); // Handle unauthorized access
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    router.push("/admin/login"); // Redirect to login
  };

  if (!isClient) return null; // Prevent hydration mismatch

  return (
    <>
    <Head>
        <title>C3H Global Dashboard</title>
      </Head>
    <Layout>
      <h1 className="text-2xl">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6 mt-5">
        <div className="card group relative">
<div><h2 className="text-lg font-semibold mb-2">Total Users</h2>
<p className="text-gray-600">150</p></div>
<div className="absolute top-5 right-5 text-5xl text-gray-200 flex group-hover:text-gray-400">
        <FaUsers /></div>
        </div>
        <div className="card group relative">
        <div>
          <h2 className="text-lg font-semibold mb-2">Jobs Posted</h2>
          <p className="text-gray-600">320</p>
          </div>
          <div className="absolute top-5 right-5 text-5xl text-gray-200 flex group-hover:text-gray-400">
        <LuListChecks /></div>
        </div>
        <div className="card group relative">
        <div>
          <h2 className="text-lg font-semibold mb-2">Active Admins</h2>
          <p className="text-gray-600">5</p>
          </div>
          <div className="absolute top-5 right-5 text-5xl text-gray-200 flex group-hover:text-gray-400">
        <FaUsersGear /></div>
        </div>
      </div>
      <h2 className="mt-5 text-lg">Current Admins</h2>
      <ul className="mt-3">
        {admins.length > 0 ? (
          admins.map((admin) => (
            <li key={admin.id} className="border-b p-2">
              {admin.name} - {admin.email}
            </li>
          ))
        ) : (
          <p>No admins found.</p>
        )}
      </ul>
    </Layout>
    </>
  );
}
