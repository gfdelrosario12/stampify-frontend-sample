"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { ArrowRight, X, Eye, EyeOff } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRegister: boolean;
  onToggleMode: () => void;
}

export default function LoginModal({ isOpen, onClose, isRegister, onToggleMode }: LoginModalProps) {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Clear confirm password when switching modes
  useEffect(() => {
    if (!isRegister) {
      setConfirmPassword("");
    }
  }, [isRegister]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!isRegister) {
        // LOGIN
        console.log('🔐 Starting login process...')
        const result = await login(email, password);
        console.log('📊 Login result:', result)
        
        if (result.success) {
          console.log('✅ Login successful, user data:', result.user)
          
          // Close modal first
          onClose();
          
          // Route based on user role
          const userRole = result.user?.role?.toUpperCase();
          console.log('🔄 Routing user with role:', userRole)
          
          if (userRole === 'ADMIN') {
            router.push('/admin');
          } else if (userRole === 'MEMBER') {
            router.push('/member');
          } else if (userRole === 'SCANNER') {
            router.push('/scanner');
          } else {
            router.push('/');
          }
        } else {
          console.error('❌ Login failed:', result.error)
          setError(result.error || "Invalid credentials");
        }
      } else {
        // REGISTER
        if (!firstName || !lastName) {
          setError("First and last name are required for registration");
          setLoading(false);
          return;
        }

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(password)) {
          setError("Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character");
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match");
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
            role: "MEMBER", // Default role for self-registration
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          let errorMessage = "Registration failed";
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = `Registration failed: ${res.statusText}`;
          }
          
          setError(errorMessage);
          setLoading(false);
          return;
        }

        const userData = await res.json();

        // Show success message
        setSuccess(`Account created successfully for ${email}! Please log in with your credentials.`);
        setError(null);
        setLoading(false);

        // Clear form fields
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        // Auto-switch to login after 2 seconds
        setTimeout(() => {
          onToggleMode();
          setSuccess(null);
        }, 2000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong");
    } finally {
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
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800/70 text-white border border-purple-500/30 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {isRegister && (
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-800/70 text-white border border-purple-500/30 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : isRegister ? "Register" : "Login"}
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