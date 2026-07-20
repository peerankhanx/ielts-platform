"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Headphones,
  PenLine,
  Mic,
  ClipboardList,
  Sparkles,
  Library,
  CalendarClock,
  BarChart3,
  Trophy,
  CreditCard,
  User,
  Settings,
  LifeBuoy,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/utils/cn";

const nav = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/reading", label: "Reading", icon: BookOpen },
  { href: "/student/listening", label: "Listening", icon: Headphones },
  { href: "/student/writing", label: "Writing", icon: PenLine },
  { href: "/student/speaking", label: "Speaking", icon: Mic },
  { href: "/student/mock-tests", label: "Mock Tests", icon: ClipboardList },
  { href: "/student/adaptive", label: "Adaptive AI Tests", icon: Sparkles },
  { href: "/student/library", label: "Books Library", icon: Library },
  { href: "/student/planner", label: "Study Planner", icon: CalendarClock },
  { href: "/student/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/student/achievements", label: "Achievements", icon: Trophy },
  { href: "/student/subscription", label: "Subscription", icon: CreditCard },
  { href: "/student/profile", label: "Profile", icon: User },
  { href: "/student/settings", label: "Settings", icon: Settings },
  { href: "/student/support", label: "Support", icon: LifeBuoy },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border bg-background transition-all duration-200 md:flex",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && <span className="font-display text-lg font-bold">Bandwise</span>}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-lg p-1.5 text-text-soft hover:bg-bg-subtle"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
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
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
