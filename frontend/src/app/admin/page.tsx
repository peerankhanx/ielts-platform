"use client";

import { Users, BookOpen, Headphones, PenLine, Mic, TrendingUp } from "lucide-react";
import { useAdminStats } from "@/hooks/use-admin";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError } = useAdminStats();

  if (isLoading) return <p className="text-sm text-text-soft">Loading dashboard…</p>;
  if (isError || !stats) return <p className="text-sm text-error">Couldn&apos;t load admin stats.</p>;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Admin dashboard</h1>
        <p className="mt-1 text-sm text-text-soft">Platform overview and student activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">{stats.users.total}</p>
              <p className="text-xs text-text-soft">Total users ({stats.users.students} students)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">{stats.averageCurrentBand ?? "—"}</p>
              <p className="text-xs text-text-soft">Average current band</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-xs text-text-soft">Admins</p>
            <p className="font-display text-2xl font-bold">{stats.users.admins}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Completed attempts by module</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
              <BookOpen className="h-6 w-6 text-primary" />
              <p className="font-display text-xl font-bold">{stats.completedAttempts.reading}</p>
              <p className="text-xs text-text-soft">Reading</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
              <Headphones className="h-6 w-6 text-primary" />
              <p className="font-display text-xl font-bold">{stats.completedAttempts.listening}</p>
              <p className="text-xs text-text-soft">Listening</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
              <PenLine className="h-6 w-6 text-primary" />
              <p className="font-display text-xl font-bold">{stats.completedAttempts.writing}</p>
              <p className="text-xs text-text-soft">Writing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
              <Mic className="h-6 w-6 text-primary" />
              <p className="font-display text-xl font-bold">{stats.completedAttempts.speaking}</p>
              <p className="text-xs text-text-soft">Speaking</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
