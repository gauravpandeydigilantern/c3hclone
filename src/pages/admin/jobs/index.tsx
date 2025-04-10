import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";

interface Job {
  id: string;
  jobTitle: string;
  companyWebsite: string;
  country: string;
  status: boolean;
  saveDraft: boolean;
  isFeatured: boolean;
  user_id?: string; // Added user_id property
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const router = useRouter();

  const validateToken = () => {
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

    setLoading(true);
    fetch(`/api/job-post?page=${currentPage}&limit=10&search=${search}`)
      .then((res) => res.json())
      .then((data) => {
        setTotalPages(data.totalPages || 1);
        setJobs(data.jobs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentPage, search]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      const updatedJobs = jobs.filter((job) => job.id !== id);
      setJobs(updatedJobs);
      await fetch(`/api/job-post/${id}`, { method: "DELETE" }).catch(() => {
        alert("Error deleting the job");
        // Optionally, re-fetch the jobs if needed
      });
    }
  };

  const updateJobStatus = async (id: string, status: boolean) => {
    if (!validateToken()) return;

    const tokenData = localStorage.getItem("token");
    const { token } = JSON.parse(tokenData || '{}');

    // Optimistically update the status
    const updatedJobs = jobs.map((job) =>
      job.id === id ? { ...job, status: !status } : job
    );
    setJobs(updatedJobs);

    try {
      await fetch(`/api/job-post/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ jobId: id, status: !status }),
      });
    } catch (error) {
      alert("Error updating job status");
      // Revert status change if the API request fails
      const revertedJobs = jobs.map((job) =>
        job.id === id ? { ...job, status } : job
      );
      setJobs(revertedJobs);
    }
  };

  const updateIsFeatured = async (id: string, isFeatured: boolean) => {
    if (!validateToken()) return;
      
      const tokenData = localStorage.getItem("token");
      const { token } = JSON.parse(tokenData || '{}');
  
      // Optimistically update the isFeatured status
      const updatedJobs = jobs.map((job) =>
        job.id === id ? { ...job, isFeatured: !isFeatured } : job
      );
      setJobs(updatedJobs);
  
      try {
        await fetch(`/api/job-post/featured`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ jobId: id, isFeatured: !isFeatured }),
        });
      } catch (error) {
        alert("Error updating job featured status");
        // Revert status change if the API request fails
        const revertedJobs = jobs.map((job) =>
          job.id === id ? { ...job, isFeatured } : job
        );
        setJobs(revertedJobs);
      }
    }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Manage Jobs</h1>
        <Link href="/admin/jobs/add" className="bg-green-500 text-white p-2 rounded">
          Add Job
        </Link>
      </div>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by job title, company, or location"
          className="bg-white w-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 mr-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <table className="w-full table border-collapse">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Company Website</th>
              <th>Country</th>
              <th>Is Draft</th>
              <th className="text-center" style={{ width: 120, textAlign: "center" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.jobTitle}</td>
                <td>{job.companyWebsite}</td>
                <td>{job.country}</td>
                <td> 
                  {job.saveDraft ? <span className="text-gray-400">Draft</span> : <span className="text-green-500">Published</span> }
                  
                </td>

                <td>
                  <div className="flex justify-center">
                  {job.user_id ? '' : (
                    <div className="flex items-center">
                      <Link href={`/admin/jobs/edit/${job.id}`} className="btn-primary2 py-1 px-2 rounded mr-2" title="Edit">
                        <FiEdit />
                      </Link>
                      <button className="bg-red-500 text-white py-1 px-2 rounded" onClick={() => handleDelete(job.id)} title="Delete">
                        <RiDeleteBin6Line />
                      </button>
                    </div>
                  )}
                    <button
                      onClick={() => updateJobStatus(job.id, job.status)}
                      className={`ml-2 py-1 px-2 rounded ${job.status ? "bg-green-500 text-white" : "bg-gray-300 text-black"}`}
                      title={job.status ? "Set Inactive" : "Set Active"}
                    >
                      {job.status ? <span className="text-white">✔</span> : <span className="text-red-500">✖</span>}
                    </button>
                    <button
                      onClick={() => updateIsFeatured(job.id, job.isFeatured)}
                      className={`ml-2 py-1 px-2 rounded ${job.isFeatured ? "bg-yellow-500 text-white" : "bg-gray-300 text-black"}`}
                      title={job.isFeatured ? "Set Not Featured" : "Set Featured"}
                    >
                      {job.isFeatured ? <span className="text-white">⭐</span> : <span className="text-gray-500">☆</span>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="mt-4 flex justify-self-end space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 border border-gray-300 rounded-md bg-white disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-4 py-2">
          Page {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))}
          disabled={currentPage === totalPages}
          className="px-3 border border-gray-300 rounded-md bg-white disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <button className="mt-5 bg-gray-500 text-white p-2 rounded" onClick={() => router.push("/admin/dashboard")}>
        Back to Dashboard
      </button>
    </Layout>
  );
}
