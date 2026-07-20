"use client";

import Link from "next/link";
import { PenLine, Clock, Type } from "lucide-react";
import { useWritingTasks } from "@/hooks/use-writing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/progress-bar";

const TASK_TYPE_LABEL: Record<string, string> = {
  task_1: "Task 1",
  task_2: "Task 2",
};

export default function WritingListPage() {
  const { data: tasks, isLoading, isError } = useWritingTasks();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Writing practice</h1>
        <p className="mt-1 text-sm text-text-soft">
          Write your essay, then get AI-evaluated feedback against all four IELTS criteria.
        </p>
      </div>

      {isLoading && <p className="text-sm text-text-soft">Loading tasks…</p>}

      {isError && (
        <Card>
          <CardContent className="text-sm text-error">
            Couldn&apos;t reach the writing service. Make sure the backend is running.
          </CardContent>
        </Card>
      )}

      {tasks && tasks.length === 0 && (
        <Card>
          <CardContent className="text-sm text-text-soft">No writing tasks published yet.</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tasks?.map((task) => (
          <Link key={task.id} href={`/student/writing/${task.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex h-full flex-col gap-3">
                <div className="flex items-center justify-between">
                  <PenLine className="h-5 w-5 text-primary" />
                  <Badge variant="info">{TASK_TYPE_LABEL[task.taskType] ?? task.taskType}</Badge>
                </div>
                <h3 className="font-display text-lg font-semibold">{task.title}</h3>
                <div className="mt-auto flex items-center gap-4 text-xs text-text-soft">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {task.timeLimitMinutes} minutes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5" /> {task.minWords}+ words
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
