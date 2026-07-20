"use client";

import { useParams, useRouter } from "next/navigation";
import { Clock, Headphones, ListChecks } from "lucide-react";
import { useListeningTest, useStartListeningAttempt } from "@/hooks/use-listening";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ListeningTestOverviewPage() {
  const params = useParams<{ testId: string }>()!;
  const router = useRouter();
  const { data: test, isLoading, isError } = useListeningTest(params.testId);
  const startAttempt = useStartListeningAttempt(params.testId);

  const handleStart = async () => {
    const attempt = await startAttempt.mutateAsync();
    router.push(`/student/listening/${params.testId}/attempt/${attempt.id}`);
  };

  if (isLoading) return <p className="text-sm text-text-soft">Loading test…</p>;
  if (isError || !test) return <p className="text-sm text-error">Couldn&apos;t load this test.</p>;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-5">
          <div>
            <h1 className="font-display text-2xl font-bold">{test.title}</h1>
            <p className="mt-2 text-sm text-text-soft">{test.description}</p>
          </div>

          <div className="flex flex-wrap gap-6 border-y border-border py-4">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Clock className="h-4 w-4 text-primary" /> {test.timeLimitMinutes} minutes
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Headphones className="h-4 w-4 text-primary" /> {test.sections.length} audio section
              {test.sections.length !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <ListChecks className="h-4 w-4 text-primary" /> {test.questions.length} questions
            </div>
          </div>

          <p className="text-xs text-text-soft">
            The audio plays once you start — you can pause and replay it as often as you like while
            practicing (the real exam only allows one play, but this is practice mode).
          </p>

          <Button size="lg" onClick={handleStart} isLoading={startAttempt.isPending} className="w-full">
            Start test
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
