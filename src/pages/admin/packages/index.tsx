import { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";

export default function Packages() {
  const [isClient, setIsClient] = useState(false); // Ensures rendering only on the client
  const [packages, setPackages] = useState<any[]>([]); // Ensure initial state is an empty array
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setIsClient(true); // Now safe to access localStorage
    fetch(`/api/packages?page=${currentPage}`)
      .then((res) => res.json())
      .then((data) => {
        setPackages(data || []); // Set an empty array if no data is available
        setTotalPages(data.totalPages || 1); // Set a fallback for totalPages
      })
      .catch((error) => {
        console.error("Error fetching packages:", error);
        setPackages([]); // Fallback in case of error
        setTotalPages(1); // Fallback totalPages in case of error
      });
  }, [currentPage]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await fetch(`/api/packages/${id}`, { method: "DELETE" });
      window.location.reload();
    }
  };

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl">Manage Packages</h1>
          <Link href="/admin/packages/add" className="bg-green-500 text-white p-2 rounded">
            Add Package
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="table border border-gray-200">
            <thead>
              <tr>
                <th>Package Name</th>
                <th>Max Jobs</th>
                <th>Max Portfolio</th>
                <th>Price</th>
                <th>Premium</th>
                <th className="text-center" style={{width:120,textAlign:'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.length > 0 ? (
                packages.map((pkg: any) => (
                  <tr key={pkg.id} className="border-t">
                    <td >{pkg.package_name}</td>
                    <td>{pkg.max_job_posts}</td>
                    <td>{pkg.max_portfolio}</td>
                    <td>${pkg.price}</td>
                    <td>{pkg.is_premium ? "Yes" : "No"}</td>
                    <td>
                      <div className="flex justify-center">
                      <Link href={`/admin/packages/edit/${pkg.id}`} className="btn-primary2 py-1 px-2 rounded mr-2" title="Edit"><FiEdit /></Link>
                      <button onClick={() => handleDelete(pkg.id)} className="bg-red-500 text-white py-1 px-2 rounded" title="Delete"><RiDeleteBin6Line /></button>
                      </div></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-2">
                    No packages available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`mx-1 px-3 py-1 border ${page === currentPage ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
