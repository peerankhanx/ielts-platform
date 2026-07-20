"use client";

import { Search } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { NotificationBell } from "./notification-bell";

export function StudentTopbar() {
  const user = useAuthStore((s) => s.user);
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "S";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <div className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-bg-subtle px-3 py-2">
        <Search className="h-4 w-4 text-text-soft" />
        <input
          placeholder="Search tests, books, topics..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-text-soft"
        />
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {initials}
        </div>
      </div>
    </header>
  );
}
