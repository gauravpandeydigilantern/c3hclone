import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";

export default function JobSkillList() {
  const [jobSkills, setJobSkills] = useState([]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobSkills();
  }, []);

  const fetchJobSkills = async () => {
    const response = await fetch("/api/job-skills");
    const data = await response.json();
    setJobSkills(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const body = JSON.stringify(editingId ? { id: editingId, name, status } : { name, status });

    await fetch("/api/job-skills", {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    setName("");
    setStatus(true);
    setEditingId(null);
    fetchJobSkills();
  };

  const handleEdit = (jobSkill: any) => {
    setName(jobSkill.name);
    setStatus(jobSkill.status);
    setEditingId(jobSkill.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    
    await fetch(`/api/job-skills?id=${id}`, { method: "DELETE" });
    fetchJobSkills();
  };

  return (
    <div>
      <h1 className="text-2xl mb-4">Job Skills</h1>

      <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap gap-3 items-center">
        <input 
          type="text" 
          placeholder="Job Skill Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          className="bg-white flex-1 min-w-[200px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
        />
        <select 
          value={status ? "true" : "false"} 
          onChange={(e) => setStatus(e.target.value === "true")} 
          className="bg-white p-2 border border-gray-300 rounded flex-shrink-0 min-w-[120px]"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button 
          type="submit" 
          className="bg-green-500 text-white p-2 rounded flex-shrink-0 min-w-[120px]"
        >
          {editingId ? "Update" : "Add Skill"}
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
          {jobSkills.map((jobSkill: any) => (
            <tr key={jobSkill.id}>
              <td>{jobSkill.name}</td>
              <td>{jobSkill.status ? "Active" : "Inactive"}</td>
              <td>
                <button onClick={() => handleEdit(jobSkill)} className="btn-primary2 py-1 px-2 rounded mr-2" title="Edit"><FiEdit /></button>
                <button onClick={() => handleDelete(jobSkill.id)} className="bg-red-500 text-white px-2 py-1 rounded" title="Delete"><RiDeleteBin6Line /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  );
}
