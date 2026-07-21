"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isHydrating) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      router.replace("/student/dashboard");
      return;
    }
    setReady(true);
  }, [user, isHydrating, router]);

  if (!ready) {
    return <div className="flex h-screen items-center justify-center text-lg">Loading admin...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-bg-subtle p-6">{children}</main>
    </div>
  );
}