"use client";

import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";

export default function JobCategoryList() {
  const [jobCategories, setJobCategories] = useState([]);
  const [name, setName] = useState("");
  const [iconImage, setIconImage] = useState<File | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchJobCategories();
  }, [page, search]);

  const fetchJobCategories = async () => {
    const response = await fetch(`/api/job-categories?page=${page}&limit=10&search=${search}`);
    const data = await response.json();
    setJobCategories(data.jobCategories);
    setTotalPages(data.totalPages || 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (parentId) formData.append("parent_id", parentId);
    if (iconImage) formData.append("icon", iconImage);

    const method = editingId ? "PUT" : "POST";
    if (editingId) formData.append("id", editingId);

    await fetch("/api/job-categories", {
      method,
      body: formData,
    });

    setName("");
    setIconImage(null);
    setParentId(null);
    setDescription("");
    setEditingId(null);
    fetchJobCategories();
  };

  const handleEdit = (jobCategory: any) => {
    setName(jobCategory.name);
    setParentId(jobCategory.parent_id);
    setDescription(jobCategory.description);
    setEditingId(jobCategory.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    await fetch(`/api/job-categories?id=${id}`, { method: "DELETE" });
    fetchJobCategories();
  };

  return (
    <div>
      <h1 className="text-2xl mb-4">Job Categories</h1>

      <form onSubmit={handleSubmit} className="mb-4 w-full flex flex-wrap gap-3" encType="multipart/form-data">
        <input 
          type="text" 
          placeholder="Category Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          className="bg-white flex-1 min-w-[200px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
        />

        <input 
          type="file"
          onChange={(e) => setIconImage(e.target.files ? e.target.files[0] : null)}
          required={!editingId}
          className="bg-white flex-1 min-w-[200px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
        />

        {/* <select value={parentId || ""} onChange={(e) => setParentId(e.target.value || null)}>
          <option value="">No Parent</option>
          {jobCategories.map((category: any) => (
        <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select> */}

        <textarea 
          placeholder="Description"
          value={description}
          rows={1}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-white flex-1 min-w-[200px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
        ></textarea>

        <button 
          type="submit" 
          className="bg-green-500 text-white p-2 rounded min-w-[150px]"
        >
          {editingId ? "Update" : "Add Category"}
        </button>
      </form>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          className="bg-white w-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 mr-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <table className="w-full table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Icon</th>
            {/* <th>Parent Category</th> */}
            {/* <th className="description">Description</th> */}
            <th className="text-center" style={{width:120,textAlign:'center'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobCategories.map((jobCategory: any) => (
            <tr key={jobCategory.id}>
              <td>{jobCategory.name}</td>
              <td>
                {jobCategory.icon && <img src={jobCategory.icon} alt="icon" className="w-10 h-10" />}
              </td>
              {/* <td>{jobCategory.parent ? jobCategory.parent.name : "None"}</td> */}
              {/* <td className="description">{jobCategory.description}</td> */}
              <td className="text-center">
                <button onClick={() => handleEdit(jobCategory)} className="btn-primary2 py-1 px-2 rounded mr-2" title="Edit"><FiEdit /></button>
                <button onClick={() => handleDelete(jobCategory.id)} className="bg-red-500 text-white px-2 py-1 rounded" title="Delete"><RiDeleteBin6Line /></button>
              </td>
            </tr>
          ))}

          {jobCategories.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center p-4">No job categories found</td>
            </tr>
          )}

        </tbody>
      </table>
       {/* Pagination */}
       <div className="mt-4 flex justify-self-end space-x-2">
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
  );
}
