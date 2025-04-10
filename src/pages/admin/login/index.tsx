import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import "../../../app/globals.css";
import Image from "next/image";
import Head from "next/head";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State for storing error messages
  const router = useRouter();

  // Check if the user is already logged in and token is valid
  useEffect(() => {
    const tokenData = localStorage.getItem("token");
    if (tokenData) {
      const { token, expiresAt } = JSON.parse(tokenData);
      if (new Date().getTime() < expiresAt) {
        router.push("/admin/dashboard");
      } else {
        localStorage.removeItem("token");
      }
    }
  }, [router]);

  const validateForm = () => {
    // Email regex to check if the email is in a valid format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (!password ) {
      setError("Password is required.");
      return false;
    }

    setError(""); // Clear any existing error messages
    return true;
  };

  const handleLogin = async () => {
    // Validate form inputs
    if (!validateForm()) return;

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      const expiresAt = new Date().getTime() + 2 * 60 * 60 * 1000; // 2 hours from now
      const token = data.token;
      const tokenData = { token, expiresAt };
      localStorage.setItem("token", JSON.stringify(tokenData));
      router.push("/admin/dashboard");
    } else {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <>
      <Head>
        <title>C3H Global Admin Login</title>
      </Head>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <h2 className="text-center mb-6">
            <Image
              src="/images/c3h-logo.png"
              alt="C3H Global"
              width={246}
              height={60}
            />
          </h2>

          {/* Error message */}
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-800"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-800"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />

          <button
            onClick={handleLogin}
            className="w-full py-3 btn-primary text-white rounded-md"
          >
            Login
          </button>
        </div>
      </div>
    </>
  );
}
