import Link from "next/link";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/#modules", label: "Modules" },
  { href: "/#ai-engine", label: "AI Engine" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#institutions", label: "For Institutions" },
];

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          Bandwise
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-text-soft hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-text-soft hover:text-foreground">
            Log in
          </Link>
          <Link href="/register">
            <Button size="sm">Start free</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
