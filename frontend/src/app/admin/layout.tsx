"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  useEffect(() => {
    if (isHydrating) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      router.replace("/student/dashboard");
    }
  }, [user, isHydrating, router]);

  // The real access boundary is server-side RBAC (JwtAuthGuard + RolesGuard)
  // on every /admin/* API route — this client check only avoids flashing
  // admin UI at someone who isn't authorized before the redirect kicks in.
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-bg-subtle p-6">{children}</main>
    </div>
  );
}
