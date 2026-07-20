"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Library, LogOut } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth-service";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/content", label: "Content", icon: Library },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await authService.logout();
    logout();
    router.push("/login");
  };

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background md:flex">
      <div className="flex h-16 items-center px-5">
        <span className="font-display text-lg font-bold">Bandwise</span>
        <span className="ml-2 rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-medium text-secondary">
          ADMIN
        </span>
      </div>

      <nav className="flex-1 px-2 py-2">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-text-muted hover:bg-bg-subtle"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-bg-subtle"
        >
          <LogOut className="h-4.5 w-4.5" /> Log out
        </button>
      </div>
    </aside>
  );
}
