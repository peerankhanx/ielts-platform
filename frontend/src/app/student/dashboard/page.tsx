import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar, Badge } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { BookOpen, Headphones, PenLine, Mic, Flame, Sparkles } from "lucide-react";

// TODO(backend): replace with a React Query hook (`useDashboard()`) hitting
// GET /api/v1/dashboard once the backend `dashboard` endpoint ships. Shape
// mirrors the ApiResponse<DashboardData> contract defined in the API spec.
const mockDashboard = {
  student: { firstName: "Amara", targetBand: 7.5, currentBand: 6.5, examDate: "2026-09-14" },
  subscription: { plan: "Premium Monthly", status: "active" as const },
  moduleProgress: [
    { module: "reading", label: "Reading", band: 7.0, icon: BookOpen },
    { module: "listening", label: "Listening", band: 6.5, icon: Headphones },
    { module: "writing", label: "Writing", band: 6.0, icon: PenLine },
    { module: "speaking", label: "Speaking", band: 6.5, icon: Mic },
  ],
  weeklyStudyMinutes: 320,
  streakDays: 18,
  recentActivity: [
    { label: "Writing Task 2 — Argumentative essay", detail: "Band 6.5 · 2 hours ago" },
    { label: "Reading Practice — Matching Headings", detail: "82% accuracy · yesterday" },
    { label: "Full Mock Test #3", detail: "Overall Band 6.5 · 3 days ago" },
  ],
  aiRecommendations: [
    "Focus on Writing Task 2 coherence — practice 3 essays this week.",
    "Revisit Matching Headings; accuracy dropped 12% in the last 2 attempts.",
    "Your Speaking fluency is improving — try Part 3 discussion topics next.",
  ],
};

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function StudentDashboardPage() {
  const d = mockDashboard;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* Welcome + quick actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Welcome back, {d.student.firstName}</h1>
          <p className="mt-1 text-sm text-text-soft">
            Target Band {d.student.targetBand} · {daysUntil(d.student.examDate)} days until your exam
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/student/mock-tests"><Button variant="outline">Start mock test</Button></Link>
          <Link href="/student/writing"><Button>Continue practice</Button></Link>
        </div>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-soft">Overall estimated band</p>
              <p className="font-display text-3xl font-bold text-primary">{d.student.currentBand}</p>
            </div>
            <Badge variant="info">Target {d.student.targetBand}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10 text-warning">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">{d.streakDays} days</p>
              <p className="text-xs text-text-soft">Current study streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-text-soft">Subscription</p>
            <p className="mt-1 font-display text-lg font-semibold">{d.subscription.plan}</p>
            <Badge variant="success" className="mt-2">Active</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Module progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Progress by module</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {d.moduleProgress.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.module}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Icon className="h-4 w-4 text-text-soft" /> {m.label}
                    </span>
                    <span className="font-mono text-sm text-text-soft">{m.band.toFixed(1)}</span>
                  </div>
                  <ProgressBar value={m.band} max={9} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* AI recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {d.aiRecommendations.map((rec, i) => (
              <p key={i} className="rounded-lg bg-bg-subtle p-3 text-sm text-text-muted">
                {rec}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {d.recentActivity.map((a, i) => (
            <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <span className="text-sm font-medium">{a.label}</span>
              <span className="text-xs text-text-soft">{a.detail}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
