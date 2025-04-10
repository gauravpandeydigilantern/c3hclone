import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import { useRouter } from "next/router";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";

export default function TestimonialsList() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Token validation function
  const validateToken = useCallback(() => {
    const tokenData = localStorage.getItem("token");
    if (!tokenData) {
      router.push("/admin/login");
      return false;
    }
    const { token, expiresAt } = JSON.parse(tokenData);
    if (new Date().getTime() > expiresAt) {
      localStorage.removeItem("token");
      router.push("/admin/login");
      return false;
    }
    return true;
  }, [router]);

  // Check token on component mount
  useEffect(() => {
    if (!validateToken()) return;
  }, [validateToken]);

  // Fetch testimonials with error handling
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials");
        if (!response.ok) throw new Error("Failed to fetch testimonials");
        const data = await response.json();
        setTestimonials(data);
      } catch (error:any) {
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl">Testimonials</h1>
          <Link href="/admin/testimonials/add">
            <button className="bg-green-500 text-white p-2 rounded">
              Add Testimonial
            </button>
          </Link>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <table className="w-full table border-collapse">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Position</th>
                <th className="text-center" style={{width:120,textAlign:'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-full"
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.position}</td>
                  <td>
                    <Link href={`/admin/testimonials/edit/${item.id}`}>
                      <button className="btn-primary2 py-1 px-2 rounded mr-2"  title="Edit">
                        <FiEdit />
                      </button>
                    </Link>
                    <button className="bg-red-500 text-white py-1 px-2 rounded" title="Delete">
                     <RiDeleteBin6Line />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
