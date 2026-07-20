"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Sparkles } from "lucide-react";
import { useWritingTask } from "@/hooks/use-writing";
import { writingService } from "@/services/writing-service";
import { useCountdown } from "@/hooks/use-countdown";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar, Badge } from "@/components/ui/progress-bar";
import { cn } from "@/utils/cn";
import type { WritingSubmission } from "@/types/writing";

export default function WritingSubmissionPage() {
  const params = useParams<{ taskId: string; submissionId: string }>()!;
  const router = useRouter();

  const { data: task, isLoading: taskLoading } = useWritingTask(params.taskId);
  const submissionQuery = useQuery({
    queryKey: ["writing", "submission", params.submissionId],
    queryFn: () => writingService.getSubmission(params.submissionId),
  });

  const [essayText, setEssayText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<WritingSubmission | null>(null);
  const hydrated = useRef(false);

  const submission = submissionQuery.data;
  const isEvaluated = result?.status === "evaluated" || submission?.status === "evaluated";

  // Hydrate the editor once with whatever draft already exists (e.g. reload mid-write).
  useEffect(() => {
    if (submission && !hydrated.current) {
      setEssayText(submission.essayText);
      setWordCount(submission.wordCount);
      hydrated.current = true;
    }
  }, [submission]);

  const persistEssay = useCallback(
    async (text: string) => {
      setIsSaving(true);
      try {
        const res = await writingService.updateEssay(params.submissionId, text);
        setWordCount(res.wordCount);
      } finally {
        setIsSaving(false);
      }
    },
    [params.submissionId]
  );
  const debouncedSave = useDebouncedCallback(persistEssay, 800);

  const handleChange = (value: string) => {
    setEssayText(value);
    debouncedSave(value);
  };

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const submitted = await writingService.submit(params.submissionId);
      setResult(submitted);
    } finally {
      setSubmitting(false);
    }
  }, [params.submissionId]);

  const countdown = useCountdown(
    submission?.startedAt ?? new Date().toISOString(),
    task?.timeLimitMinutes ?? 40
  );

  const autoSubmitted = useRef(false);
  useEffect(() => {
    if (countdown.isExpired && !isEvaluated && !autoSubmitted.current && !submitting) {
      autoSubmitted.current = true;
      void handleSubmit();
    }
  }, [countdown.isExpired, isEvaluated, submitting, handleSubmit]);

  if (taskLoading || submissionQuery.isLoading) {
    return <p className="text-sm text-text-soft">Loading…</p>;
  }
  if (!task || !submission) {
    return <p className="text-sm text-error">Couldn&apos;t load this submission.</p>;
  }

  const evaluation = result?.evaluation ?? submission.evaluation;

  if (isEvaluated && evaluation) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-text-soft">Overall band</p>
            <p className="font-display text-6xl font-bold text-primary">{evaluation.overallBand.toFixed(1)}</p>
            <Badge variant={evaluation.evaluator === "claude" ? "success" : "info"} className="mt-1">
              {evaluation.evaluator === "claude" ? "AI-evaluated" : "Heuristic evaluation"}
            </Badge>
            <Button className="mt-4" onClick={() => router.push("/student/writing")}>
              Back to writing tasks
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[
              { label: "Task Achievement", value: evaluation.taskAchievement },
              { label: "Coherence & Cohesion", value: evaluation.coherenceCohesion },
              { label: "Lexical Resource", value: evaluation.lexicalResource },
              { label: "Grammatical Range", value: evaluation.grammaticalRange },
            ].map((c) => (
              <div key={c.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{c.label}</span>
                  <span className="font-mono text-text-soft">{c.value.toFixed(1)}</span>
                </div>
                <ProgressBar value={c.value} max={9} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {evaluation.feedback.strengths.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-success">Strengths</p>
                <ul className="flex flex-col gap-1.5">
                  {evaluation.feedback.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-text-muted">
                      • {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {evaluation.feedback.weaknesses.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-error">Weaknesses</p>
                <ul className="flex flex-col gap-1.5">
                  {evaluation.feedback.weaknesses.map((s, i) => (
                    <li key={i} className="text-sm text-text-muted">
                      • {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {evaluation.feedback.suggestions.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-info">Suggestions</p>
                <ul className="flex flex-col gap-1.5">
                  {evaluation.feedback.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-text-muted">
                      • {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
        <div className="text-sm text-text-soft">{task.title}</div>
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "text-xs font-medium",
              wordCount >= task.minWords ? "text-success" : "text-text-soft"
            )}
          >
            {wordCount} / {task.minWords} words {isSaving && "· saving…"}
          </span>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm font-medium",
              countdown.remainingSeconds < 120 ? "bg-error/10 text-error" : "bg-bg-subtle text-text-muted"
            )}
          >
            <Clock className="h-4 w-4" /> {countdown.label}
          </div>
          <Button size="sm" onClick={handleSubmit} isLoading={submitting}>
            Submit for evaluation
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <p className="mb-3 rounded-lg bg-bg-subtle p-3 text-sm text-text-muted">{task.promptText}</p>
          <textarea
            value={essayText}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Start writing your response here…"
            className="h-[50vh] w-full resize-none rounded-lg border border-border bg-background p-4 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </CardContent>
      </Card>
    </div>
  );
}
