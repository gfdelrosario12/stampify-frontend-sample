"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "./auth-context";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallbackUrl?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackUrl = "/" }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push(fallbackUrl);
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
      return;
    }
  }, [user, isLoading, allowedRoles, router, fallbackUrl]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-500/30 border-t-purple-500"></div>
          
          {/* Inner pulsing circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-purple-500/20 animate-pulse"></div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-white text-lg font-semibold mb-2">Authenticating...</p>
          <p className="text-purple-300 text-sm">Verifying your credentials</p>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}