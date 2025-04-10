import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";

export default function CareerLevelList() {
  const [careerLevels, setCareerLevels] = useState([]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCareerLevels();
  }, []);

  const fetchCareerLevels = async () => {
    const response = await fetch("/api/career-levels");
    const data = await response.json();
    setCareerLevels(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const body = JSON.stringify(editingId ? { career_level_id: editingId, name, status } : { name, status });

    await fetch("/api/career-levels", {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    setName("");
    setStatus(true);
    setEditingId(null);
    fetchCareerLevels();
  };

  const handleEdit = (careerLevel: any) => {
    setName(careerLevel.name);
    setStatus(careerLevel.status);
    setEditingId(careerLevel.career_level_id);
  };

  const handleDelete = async (career_level_id: string) => {
    if (!confirm("Are you sure?")) return;
    
    await fetch(`/api/career-levels?career_level_id=${career_level_id}`, { method: "DELETE" });
    fetchCareerLevels();
  };

  return (

    <div>
      <h1 className="text-2xl mb-4">Career Levels</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <input 
          type="text" 
          placeholder="Career Level Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          className="bg-white w-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 mr-3"
        />
        <select value={status ? "true" : "false"} onChange={(e) => setStatus(e.target.value === "true")} className="bg-white p-2 border border-gray-300 rounded mr-3">
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          {editingId ? "Update" : "Add Level"}
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
          { careerLevels && 
          careerLevels.map((careerLevel: any) => (
            <tr key={careerLevel.career_level_id}>
              <td>{careerLevel.name}</td>
              <td>{careerLevel.status ? "Active" : "Inactive"}</td>
              <td className="text-center">
                <button onClick={() => handleEdit(careerLevel)} className="btn-primary2 py-1 px-2 rounded mr-2" title="Edit"><FiEdit /></button>
                <button onClick={() => handleDelete(careerLevel.career_level_id)} className="bg-red-500 text-white px-2 py-1"  title="Delete"><RiDeleteBin6Line />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
