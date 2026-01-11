"use client";

import { useState, useEffect } from "react";
import axios from "axios";

type Mode = "login" | "register";

interface Organization {
  id: number;
  name: string;
}

// Dynamic base URL from environment variable
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function LoginModal() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organizationId, setOrganizationId] = useState<number | "">("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  // Fetch organizations dynamically for registration
  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const res = await axios.get<Organization[]>(`${API_BASE}/organizations`);
        setOrganizations(res.data);
      } catch (err) {
        console.error("Failed to fetch organizations", err);
      } finally {
        setLoadingOrgs(false);
      }
    }

    if (mode === "register") {
      fetchOrganizations();
    }
  }, [mode]);

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (mode === "login") {
        // LOGIN
        await axios.post(
          `${API_BASE}/users/login`,
          { email, password },
          { withCredentials: true } // For HTTP-only cookie from backend
        );
        alert("Login successful!");
      } else {
        // REGISTER
        if (!firstName || !lastName || !organizationId) {
          setError("All fields are required for registration");
          return;
        }

        await axios.post(
          `${API_BASE}/users`,
          {
            email,
            password,
            firstName,
            lastName,
            organizationId,
            role: "MEMBER", // Default role
          },
          { withCredentials: true }
        );

        alert("Registration successful! Please login.");
        setMode("login");
      }

      // Clear form fields
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setOrganizationId("");
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) setError(err.response.data.message);
      else if (err.response?.status === 401) setError("Invalid credentials");
      else setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">{mode === "login" ? "Login" : "Register"}</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "register" && (
            <>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border p-2 rounded"
                required
              />

              {loadingOrgs ? (
                <p>Loading organizations...</p>
              ) : (
                <select
                  value={organizationId}
                  onChange={(e) => setOrganizationId(Number(e.target.value))}
                  className="border p-2 rounded"
                  required
                >
                  <option value="">Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={toggleMode} className="text-blue-500 underline">
            {mode === "login" ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
