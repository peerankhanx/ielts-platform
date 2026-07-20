"use client";

import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import { useReadingTests } from "@/hooks/use-reading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/progress-bar";

export default function ReadingListPage() {
  const { data: tests, isLoading, isError } = useReadingTests();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Reading practice</h1>
        <p className="mt-1 text-sm text-text-soft">
          Split-screen passages with highlighting, just like the real test.
        </p>
      </div>

      {isLoading && <p className="text-sm text-text-soft">Loading tests…</p>}

      {isError && (
        <Card>
          <CardContent className="text-sm text-error">
            Couldn&apos;t reach the reading service. Make sure the backend is running.
          </CardContent>
        </Card>
      )}

      {tests && tests.length === 0 && (
        <Card>
          <CardContent className="text-sm text-text-soft">
            No reading tests published yet.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tests?.map((test) => (
          <Link key={test.id} href={`/student/reading/${test.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex h-full flex-col gap-3">
                <div className="flex items-center justify-between">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <Badge variant="info">{test.difficulty}</Badge>
                </div>
                <h3 className="font-display text-lg font-semibold">{test.title}</h3>
                <p className="flex-1 text-sm text-text-soft">{test.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-text-soft">
                  <Clock className="h-3.5 w-3.5" />
                  {test.timeLimitMinutes} minutes
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
