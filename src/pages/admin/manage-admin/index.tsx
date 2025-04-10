import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";

export default function ManageAdmin() {
  const [admins, setAdmins] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();


  useEffect(() => {  
    const tokenData = localStorage.getItem("token");
    if (!tokenData) {
      router.push("/admin/login");
      return;
    }
    const { token, expiresAt } = JSON.parse(tokenData);
  
    if (new Date().getTime() > expiresAt) {
      localStorage.removeItem("token"); // Remove expired token
      router.push("/admin/login");
    } else {
      fetchAdmins(); // Proceed if token is valid
    }
  }, [currentPage]);
  

  const fetchAdmins = async () => {
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

    const response = await fetch(`/api/admin?page=${currentPage}&limit=5`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      setAdmins(data.admins);
      setTotalPages(data.totalPages);
    }
  };

  const createAdmin = async () => {
    const response = await fetch("/api/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (response.ok) {
      alert("Admin created successfully");
      fetchAdmins();
      setName("");
      setEmail("");
      setPassword("");
    } else {
      alert("Error creating admin");
    }
  };

  const deleteAdmin = async (id: string) => {
    const response = await fetch("/api/admin", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      alert("Admin deleted successfully");
      fetchAdmins();
    } else {
      alert("Error deleting admin");
    }
  };

  const startEditing = (admin: any) => {
    setEditingAdmin(admin);
    setName(admin.name);
    setEmail(admin.email);
  };

  const updateAdmin = async () => {
    if (!editingAdmin) return;

    const response = await fetch("/api/admin", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ id: editingAdmin.id, name, email, password }),
    });

    if (response.ok) {
      alert("Admin updated successfully");
      fetchAdmins();
      setEditingAdmin(null);
      setName("");
      setEmail("");
      setPassword("");
    } else {
      alert("Error updating admin");
    }
  };

  return (
    <Layout>
    <div>
      <h1 className="text-2xl">Manage Admins</h1>

      <div className="mt-5">
        <h2 className="text-lg mb-1">{editingAdmin ? "Edit Admin" : "Add New Admin"}</h2>
        <input
          type="text"
          placeholder="Name"
          className="bg-white p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 mr-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="bg-white p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 mr-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!editingAdmin && (
          <input
            type="password"
            placeholder="Password"
            className="bg-white p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 mr-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        <button
          className="bg-green-500 text-white p-2 rounded"
          onClick={editingAdmin ? updateAdmin : createAdmin}
        >
          {editingAdmin ? "Update" : "Create"}
        </button>
      </div>

      <h2 className="mt-5 text-xl">Existing Admins</h2>
      <table className="min-w-full mt-3 table border-collapse">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th className="text-center" style={{width:120,textAlign:'center'}}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {admins.map((admin: any) => (
      <tr key={admin.id}>
        <td>{admin.name}</td>
        <td>{admin.email}</td>
        <td className="text-center">
          <button
            className="btn-primary2 py-1 px-2 rounded mr-2" title="Edit"
            onClick={() => startEditing(admin)}
          ><FiEdit />
          </button>
          <button
            className="bg-red-500 text-white py-1 px-2 rounded" title="Delete"
            onClick={() => deleteAdmin(admin.id)}
          >
            <RiDeleteBin6Line />
          </button>
        </td>
      </tr>
    ))}
  </tbody>
      </table>
      <div className="mt-4 flex justify-self-end space-x-2">
        <button
          className="px-3 border border-gray-300 rounded-md bg-white disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Prev
        </button>
        <span className="px-4 py-2">Page {currentPage} / {totalPages}</span>
        <button
          className="px-3 border border-gray-300 rounded-md bg-white disabled:opacity-50"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>

      <button
        className="mt-5 bg-gray-500 text-white p-2 rounded"
        onClick={() => router.push("/admin/dashboard")}
      >
        Back to Dashboard
      </button>
    </div>
    </Layout>
  );
}
