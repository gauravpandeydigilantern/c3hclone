import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";


const validateToken = (router: any) => {
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

const fetchUsers = async (currentPage: number, search: string) => {
  const tokenData = localStorage.getItem("token");
  const { token } = JSON.parse(tokenData || '{}');
  try {
    const response = await fetch(`/api/users?page=${currentPage}&limit=10&search=${search}`, {
      method: "GET", 
      headers: { "Authorization": `Bearer ${token}` },
    });
    const data = await response.json();
    return { users: data.users || [], totalPages: data.totalPages || 1 };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { users: [], totalPages: 1 };
  }
};


export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (!validateToken(router)) return;

    const loadUsers = async () => {
      setLoading(true);
      const { users, totalPages } = await fetchUsers(currentPage, search);
      setUsers(users);
      setTotalPages(totalPages);
      setLoading(false);
    };

    loadUsers();
  }, [currentPage, search, router]);

  const deleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await fetch(`/api/users/${id}`, { method: "DELETE" });
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      } catch (error) {
        alert("Error deleting the user");
      }
    }
  };

  const updateUserStatus = async (id: string, status: string) => {
    if (!validateToken(router)) return;
  
    const tokenData = localStorage.getItem("token");
    const { token } = JSON.parse(tokenData || '{}');
      const updatedUsers = users.map((user) =>
      user.id === id ? { ...user, status: status === "true" } : user
    );
    setUsers(updatedUsers);
  
    if (status === "true" && !confirm("Are you sure you want to set this user as active?")) return;
    if (status === "false" && !confirm("Are you sure you want to set this user as inactive?")) return;
  
    try {
      await fetch(`/api/users/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ userId: id, status }),
      });
    } catch (error) {
      alert("Error updating user status");
      const revertedUsers = users.map((user) =>
        user.id === id ? { ...user, status: !status === true } : user
      );
      setUsers(revertedUsers);
    }
  };
  

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Manage Users</h1>
        <Link href="/admin/users/add" className="bg-green-500 text-white p-2 rounded">
          Add User
        </Link>
      </div>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          className="bg-white w-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 mr-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full table border-collapse border">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th className="text-center" style={{ width: 120, textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td className="text-center">
                  <div className="flex justify-center">
                  <button
                      onClick={() => updateUserStatus(user.id, user.status ? "false" : "true")}
                      className={`mr-2 py-1 px-2 rounded ${user.status ? "bg-green-500 text-white" : "bg-gray-300 text-black"}`}
                      title={user.status ? "Set Inactive" : "Set Active"}
                    >
                      {user.status ? <span className="text-white-500">✔</span> : <span className="text-red-500">✖</span>}
                  </button>
                    
                    <Link
                      href={`/admin/users/edit?id=${user.id}`}
                      className="btn-primary2 py-1 px-2 rounded mr-2"
                      title="Edit"
                    >
                      <FiEdit />
                    </Link>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="bg-red-500 text-white py-1 px-2 rounded"
                      title="Delete"
                    >
                      <RiDeleteBin6Line />
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
        <span className="px-4 py-2">Page {currentPage} / {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))}
          disabled={currentPage === totalPages}
          className="px-3 border border-gray-300 rounded-md bg-white disabled:opacity-50"
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
    </Layout>
  );
}
