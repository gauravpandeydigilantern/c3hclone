import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";

export default function TagList() {
  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const response = await fetch("/api/tags");
    const data = await response.json();
    setTags(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const body = JSON.stringify(editingId ? { tag_id: editingId, name, status } : { name, status });

    await fetch("/api/tags", {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    setName("");
    setStatus(true);
    setEditingId(null);
    fetchTags();
  };

  const handleEdit = (tag: any) => {
    setName(tag.name);
    setStatus(tag.status);
    setEditingId(tag.tag_id);
  };

  const handleDelete = async (tag_id: string) => {
    if (!confirm("Are you sure?")) return;
    
    await fetch(`/api/tags?tag_id=${tag_id}`, { method: "DELETE" });
    fetchTags();
  };

  return (
    <div>
      <h1 className="text-2xl mb-4">Tags</h1>

      <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-center gap-3">
        <input 
          type="text" 
          placeholder="Tag Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          className="bg-white flex-1 min-w-[200px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
        />
        <select 
          value={status ? "true" : "false"} 
          onChange={(e) => setStatus(e.target.value === "true")} 
          className="bg-white p-2 border border-gray-300 rounded flex-shrink-0"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button 
          type="submit" 
          className="bg-green-500 text-white p-2 rounded flex-shrink-0"
        >
          {editingId ? "Update" : "Add Tag"}
        </button>
      </form>

      <table className="w-full table ">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th className="text-center" style={{width:120,textAlign:'center'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
        {tags.length === 0 ? (
          <tr>
            <td className="border p-2" colSpan={3}>No tags available</td>
          </tr>
        ) : (
          tags.map((tag: any) => (
            <tr key={tag.tag_id}>
              <td>{tag.name}</td>
              <td>{tag.status ? "Active" : "Inactive"}</td>
              <td className="text-center">
                <button onClick={() => handleEdit(tag)} className="btn-primary2 py-1 px-2 rounded mr-2" title="Edit"><FiEdit /></button>
                <button onClick={() => handleDelete(tag.tag_id)} className="bg-red-500 text-white px-2 py-1 rounded" title="Delete"><RiDeleteBin6Line /></button>
              </td>
            </tr>
          ))
        )}
        </tbody>
      </table>
    </div>
  );
}
