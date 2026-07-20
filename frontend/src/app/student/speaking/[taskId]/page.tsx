"use client";

import { useParams, useRouter } from "next/navigation";
import { Mic, ListChecks } from "lucide-react";
import { useSpeakingTask, useStartSpeakingSubmission } from "@/hooks/use-speaking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SpeakingTaskOverviewPage() {
  const params = useParams<{ taskId: string }>()!;
  const router = useRouter();
  const { data: task, isLoading, isError } = useSpeakingTask(params.taskId);
  const startSubmission = useStartSpeakingSubmission(params.taskId);

  const handleStart = async () => {
    const submission = await startSubmission.mutateAsync();
    router.push(`/student/speaking/${params.taskId}/submission/${submission.id}`);
  };

  if (isLoading) return <p className="text-sm text-text-soft">Loading task…</p>;
  if (isError || !task) return <p className="text-sm text-error">Couldn&apos;t load this task.</p>;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-5">
          <div>
            <h1 className="font-display text-2xl font-bold">{task.title}</h1>
            <p className="mt-2 text-sm text-text-soft">{task.description}</p>
          </div>

          <div className="flex flex-wrap gap-6 border-y border-border py-4">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <ListChecks className="h-4 w-4 text-primary" /> {task.parts.length} parts
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Mic className="h-4 w-4 text-primary" /> Microphone required
            </div>
          </div>

          <p className="text-xs text-text-soft">
            You&apos;ll be asked to allow microphone access. Each part gives you time to prepare (Part 2 only)
            and a target speaking time — record your answer, then move to the next part.
          </p>

          <Button size="lg" onClick={handleStart} isLoading={startSubmission.isPending} className="w-full">
            Start speaking test
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
