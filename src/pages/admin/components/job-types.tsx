import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";

import { useRouter } from "next/router";
export default function JobTypeList() {
  const router = useRouter();
  
  const [jobTypes, setJobTypes] = useState([]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);


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
    } else {
      fetchJobTypes(); // Proceed if token is valid
    }
  }, []);
  

  const fetchJobTypes = async () => {
    const response = await fetch("/api/job-types");
    const data = await response.json();
    setJobTypes(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const body = JSON.stringify(editingId ? { id: editingId, name, status } : { name, status });

    await fetch("/api/job-types", {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    setName("");
    setStatus(true);
    setEditingId(null);
    fetchJobTypes();
  };

  const handleEdit = (jobType: any) => {
    setName(jobType.name);
    setStatus(jobType.status);
    setEditingId(jobType.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    
    await fetch(`/api/job-types?id=${id}`, { method: "DELETE" });
    fetchJobTypes();
  };

  return (
    <div>
      <h1 className="text-2xl mb-4">Job Types</h1>

      <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-center gap-3">
        <input 
          type="text" 
          placeholder="Job Type Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          className="bg-white flex-1 min-w-[200px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
        />
        <select 
          value={status ? "true" : "false"} 
          onChange={(e) => setStatus(e.target.value === "true")} 
          className="bg-white p-2 border border-gray-300 rounded min-w-[120px]"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button 
          type="submit" 
          className="bg-green-500 text-white p-2 rounded min-w-[120px]"
        >
          {editingId ? "Update" : "Add Job Type"}
        </button>
      </form>

      <table className="w-full table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th className="text-center" style={{width:120,textAlign:'center'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
        {jobTypes.length === 0 ? (
          <tr>
            <td className="border p-2" colSpan={3}>No tags available</td>
          </tr>
        ) : (
          jobTypes.map((jobType: any) => (
            <tr key={jobType.id}>
              <td>{jobType.name}</td>
              <td>{jobType.status ? "Active" : "Inactive"}</td>
              <td style={{}}>
              <div className="flex justify-center">
                <button onClick={() => handleEdit(jobType)} className="btn-primary2 py-1 px-2 rounded mr-2" title="Edit"><FiEdit /></button>
                <button onClick={() => handleDelete(jobType.id)} className="bg-red-500 text-white py-1 px-2 rounded" title="Delete"><RiDeleteBin6Line /></button>
                </div>
              </td>
            </tr>
          ))
        )}
        </tbody>
      </table>
    </div>
  );
}
