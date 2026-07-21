"use client";

import { AdminSidebar } from "@/components/layouts/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-bg-subtle p-6">{children}</main>
    </div>
  );
}