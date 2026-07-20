"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { Clock, CheckCircle2, XCircle, Play, Pause, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useListeningTest } from "@/hooks/use-listening";
import { listeningService } from "@/services/listening-service";
import { useCountdown } from "@/hooks/use-countdown";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionInput } from "@/components/tests/question-input";
import { cn } from "@/utils/cn";
import type { AttemptResult } from "@/types/reading";

const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "http://localhost:4000";

export default function ListeningAttemptPage() {
  const params = useParams<{ testId: string; attemptId: string }>()!;
  const router = useRouter();

  const { data: test, isLoading: testLoading } = useListeningTest(params.testId);
  const attemptQuery = useQuery({
    queryKey: ["listening", "attempt", params.attemptId],
    queryFn: () => listeningService.getAttempt(params.attemptId),
  });

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const attempt = attemptQuery.data;
  const isCompleted = result?.status === "completed" || attempt?.status === "completed";

  const persistAnswer = useCallback(
    async (questionId: string, value: string) => {
      setSavingIds((prev) => new Set(prev).add(questionId));
      try {
        await listeningService.saveAnswer(params.attemptId, questionId, value || null);
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });
      }
    },
    [params.attemptId]
  );
  const debouncedSave = useDebouncedCallback(persistAnswer, 600);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    debouncedSave(questionId, value);
  };

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const submitted = await listeningService.submitAttempt(params.attemptId);
      setResult(submitted);
    } finally {
      setSubmitting(false);
    }
  }, [params.attemptId]);

  const countdown = useCountdown(attempt?.startedAt ?? new Date().toISOString(), test?.timeLimitMinutes ?? 10);

  const autoSubmitted = useRef(false);
  useEffect(() => {
    if (countdown.isExpired && !isCompleted && !autoSubmitted.current && !submitting) {
      autoSubmitted.current = true;
      void handleSubmit();
    }
  }, [countdown.isExpired, isCompleted, submitting, handleSubmit]);

  const answeredCount = useMemo(() => Object.values(answers).filter((v) => v.trim() !== "").length, [answers]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      void audioRef.current.play();
    }
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    void audioRef.current.play();
  };

  if (testLoading || attemptQuery.isLoading) {
    return <p className="text-sm text-text-soft">Loading your test…</p>;
  }
  if (!test || !attempt) {
    return <p className="text-sm text-error">Couldn&apos;t load this attempt.</p>;
  }

  if (isCompleted) {
    const breakdown = result?.breakdown ?? attempt.breakdown;
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-text-soft">Your band score</p>
            <p className="font-display text-6xl font-bold text-primary">
              {(result ?? attempt).bandScore?.toFixed(1) ?? "—"}
            </p>
            <p className="text-sm text-text-soft">
              {(result ?? attempt).rawScore} / {(result ?? attempt).totalQuestions} correct
            </p>
            <Button className="mt-4" onClick={() => router.push("/student/listening")}>
              Back to listening tests
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col divide-y divide-border">
            {breakdown?.map((b, i) => (
              <div key={b.questionId} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                {b.isCorrect ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {i + 1}. {b.promptText}
                  </p>
                  <p className="mt-1 text-xs text-text-soft">
                    Your answer: <span className="font-medium text-text-muted">{b.yourAnswer || "(blank)"}</span>
                    {!b.isCorrect && b.correctAnswer && (
                      <>
                        {" "}
                        · Correct:{" "}
                        <span className="font-medium text-success">
                          {Array.isArray(b.correctAnswer) ? b.correctAnswer[0] : b.correctAnswer}
                        </span>
                      </>
                    )}
                  </p>
                  {b.explanation && <p className="mt-1 text-xs italic text-text-soft">{b.explanation}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const section = test.sections[0];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-text-soft">Listen carefully, then answer</div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-soft">
            {answeredCount} / {test.questions.length} answered
          </span>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm font-medium",
              countdown.remainingSeconds < 60 ? "bg-error/10 text-error" : "bg-bg-subtle text-text-muted"
            )}
          >
            <Clock className="h-4 w-4" /> {countdown.label}
          </div>
          <Button size="sm" onClick={handleSubmit} isLoading={submitting}>
            Submit test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <h2 className="font-display text-lg font-semibold">{section.title}</h2>

              <audio
                ref={audioRef}
                src={`${MEDIA_BASE_URL}${section.audioUrl}`}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="w-full"
                controls
              />

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button variant="ghost" size="sm" onClick={restart}>
                  <RotateCcw className="h-4 w-4" /> Restart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="max-h-[70vh] overflow-y-auto">
          <CardContent className="flex flex-col gap-6">
            {test.questions.map((question, i) => (
              <QuestionInput
                key={question.id}
                index={i + 1}
                question={question}
                value={answers[question.id] ?? ""}
                isSaving={savingIds.has(question.id)}
                onChange={(value) => handleAnswerChange(question.id, value)}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
