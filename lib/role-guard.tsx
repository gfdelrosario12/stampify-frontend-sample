"use client";

import { useState, useEffect } from "react"; // ✅ include useState
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context"; // ✅ remove `type User` import

// Define UserRole inline, based on your backend roles
type UserRole = "member" | "scanner" | "admin";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackUrl?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackUrl = "/login" }: RoleGuardProps) {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setLoading(true);
      await refreshUser();

      if (!user) {
        router.push(fallbackUrl);
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        router.push("/unauthorized");
        return;
      }

      setLoading(false);
    };

    checkAccess();
  }, [user, allowedRoles, router, fallbackUrl, refreshUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
