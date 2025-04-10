import { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";

export default function Services() {
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`/api/services?page=${currentPage}`)
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services);
        setTotalPages(data.totalPages);
      });
  }, [currentPage]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    setServices(services.filter((service:any) => service.id !== id));
  };

  return (
    <Layout>
        <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Manage Services</h1>
        <Link href="/admin/services/add" className="bg-green-500 text-white p-2 rounded">
          Add Service
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>

              <th className="text-center" style={{width:120,textAlign:'center'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service:any) => (
              <tr key={service.id}>
                <td>
                  <img src={service.image} alt={service.name} className="w-10 h-10 object-cover" />
                </td>
                <td>{service.name}</td>
                <td>
                  <div className="flex justify-center">
                  <Link href={`/admin/services/edit/${service.id}`} className="btn-primary2 py-1 px-2 rounded mr-2" title="Edit"><FiEdit /></Link>
                  <button onClick={() => handleDelete(service.id)} className="bg-red-500 text-white py-1 px-2 rounded" title="Delete"><RiDeleteBin6Line /></button>
                  </div>
                </td>
              </tr>
            ))}
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
