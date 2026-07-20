"use client";

import Link from "next/link";
import { Mic } from "lucide-react";
import { useSpeakingTasks } from "@/hooks/use-speaking";
import { Card, CardContent } from "@/components/ui/card";

export default function SpeakingListPage() {
  const { data: tasks, isLoading, isError } = useSpeakingTasks();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Speaking practice</h1>
        <p className="mt-1 text-sm text-text-soft">
          Record your answers across all 3 parts, just like the real test.
        </p>
      </div>

      {isLoading && <p className="text-sm text-text-soft">Loading tasks…</p>}

      {isError && (
        <Card>
          <CardContent className="text-sm text-error">
            Couldn&apos;t reach the speaking service. Make sure the backend is running.
          </CardContent>
        </Card>
      )}

      {tasks && tasks.length === 0 && (
        <Card>
          <CardContent className="text-sm text-text-soft">No speaking tasks published yet.</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tasks?.map((task) => (
          <Link key={task.id} href={`/student/speaking/${task.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex h-full flex-col gap-3">
                <Mic className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-semibold">{task.title}</h3>
                <p className="text-sm text-text-soft">{task.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
