import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-subtle px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center font-display text-lg font-bold">
          Bandwise
        </Link>
        <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
