"use client";

import { useParams, useRouter } from "next/navigation";
import { Clock, Type, FileText } from "lucide-react";
import { useWritingTask, useStartWritingSubmission } from "@/hooks/use-writing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TASK_TYPE_LABEL: Record<string, string> = {
  task_1: "Task 1",
  task_2: "Task 2",
};

export default function WritingTaskOverviewPage() {
  const params = useParams<{ taskId: string }>()!;
  const router = useRouter();
  const { data: task, isLoading, isError } = useWritingTask(params.taskId);
  const startSubmission = useStartWritingSubmission(params.taskId);

  const handleStart = async () => {
    const submission = await startSubmission.mutateAsync();
    router.push(`/student/writing/${params.taskId}/submission/${submission.id}`);
  };

  if (isLoading) return <p className="text-sm text-text-soft">Loading task…</p>;
  if (isError || !task) return <p className="text-sm text-error">Couldn&apos;t load this task.</p>;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-5">
          <div>
            <span className="mb-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {TASK_TYPE_LABEL[task.taskType] ?? task.taskType}
            </span>
            <h1 className="font-display text-2xl font-bold">{task.title}</h1>
          </div>

          <div className="rounded-lg bg-bg-subtle p-4 text-sm leading-relaxed text-text-muted">
            {task.promptText}
          </div>

          {task.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- external/dynamic content path from the API
            <img src={task.imageUrl} alt="Task chart" className="rounded-lg border border-border" />
          )}

          <div className="flex flex-wrap gap-6 border-y border-border py-4">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Clock className="h-4 w-4 text-primary" /> {task.timeLimitMinutes} minutes
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Type className="h-4 w-4 text-primary" /> {task.minWords}+ words
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <FileText className="h-4 w-4 text-primary" /> AI-evaluated on submission
            </div>
          </div>

          <Button size="lg" onClick={handleStart} isLoading={startSubmission.isPending} className="w-full">
            Start writing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
