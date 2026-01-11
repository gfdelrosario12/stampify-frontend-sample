"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRegister: boolean;
  onToggleMode: () => void;
}

export default function LoginModal({ isOpen, onClose, isRegister, onToggleMode }: LoginModalProps) {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!isRegister) {
        // LOGIN
        const successLogin = await auth.login(email, password);
        if (successLogin) onClose();
        else setError("Invalid credentials");
      } else {
        // REGISTER
        if (!firstName || !lastName) {
          setError("First and last name are required for registration");
          setLoading(false);
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
            role: "member",
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Registration failed");
        }

        const data = await res.json();

        // Show success message
        setSuccess(`Account created successfully! Your username is ${data.email}`);
        setError(null);
        setLoading(false);

        // Auto-switch to login after 3 seconds
        setTimeout(() => {
          onToggleMode();
          setSuccess(null);
        }, 3000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="relative bg-slate-900/50 backdrop-blur-md text-white rounded-2xl p-8 w-96 shadow-2xl border border-purple-500/20">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white rounded-full transition"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegister ? "Register" : "Login"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-slate-800/70 text-white border border-purple-500/30 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-slate-800/70 text-white border border-purple-500/30 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-800/70 text-white border border-purple-500/30 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-slate-800/70 text-white border border-purple-500/30 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center gap-2"
          >
            {isRegister ? "Register" : "Login"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-300">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={onToggleMode}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
