import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useRouter } from "next/router";

export default function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchContacts = () => {
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
  
    fetch(`/api/job-applied?page=${page}&limit=10&search=${search}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token"); // Handle unauthorized access
          router.push("/admin/login");
          throw new Error("Unauthorized, redirecting to login...");
        }
        return res.json();
      })
      .then((data) => {
        setContacts(data.appliedJobs || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch((error) => {
        console.error("Error fetching contacts:", error);
      });
  };
  
  

  useEffect(() => {
    fetchContacts();
  }, [page, search]);

  return (
    <Layout>
      <div>
          <h1 className="text-2xl mb-4">Applied Job</h1>
          <input
            type="text"
            placeholder="Search by name or email"
            className="bg-white w-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 mr-3 mb-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        <table className="w-full table border-collapse">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Job Name</th>
              <th>Employer name</th>
              <th>Company phone</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((item: any) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.jobDetails.jobTitle}</td>
                <td>{item.jobDetails.companyWebsite}</td>
                <td>{item.jobDetails.companyWebsite}</td>
                
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="mt-4 flex flex justify-self-end space-x-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 border border-gray-300 rounded-md bg-white disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-4 py-2">Page {page} / {totalPages}</span>
          <button
            onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
            disabled={page === totalPages}
            className="px-3 border border-gray-300 rounded-md bg-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
}
