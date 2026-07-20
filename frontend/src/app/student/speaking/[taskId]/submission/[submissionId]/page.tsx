"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mic, Square, Play, RotateCcw, ChevronRight, Info } from "lucide-react";
import { useSpeakingTask } from "@/hooks/use-speaking";
import { speakingService } from "@/services/speaking-service";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar, Badge } from "@/components/ui/progress-bar";
import type { SpeakingSubmission } from "@/types/speaking";

const CRITERIA_LABELS: Record<string, string> = {
  fluencyCoherence: "Fluency & Coherence",
  lexicalResource: "Lexical Resource",
  grammaticalRange: "Grammatical Range",
  pronunciation: "Pronunciation",
};

export default function SpeakingSubmissionPage() {
  const params = useParams<{ taskId: string; submissionId: string }>()!;
  const router = useRouter();

  const { data: task, isLoading: taskLoading } = useSpeakingTask(params.taskId);
  const submissionQuery = useQuery({
    queryKey: ["speaking", "submission", params.submissionId],
    queryFn: () => speakingService.getSubmission(params.submissionId),
  });

  const [partIndex, setPartIndex] = useState(0);
  const [uploadedParts, setUploadedParts] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SpeakingSubmission | null>(null);
  const [prepDoneForPart, setPrepDoneForPart] = useState<string | null>(null);

  const recorder = useAudioRecorder();
  const audioPreviewRef = useRef<HTMLAudioElement>(null);

  const submission = submissionQuery.data;
  const isEvaluated = result?.status === "evaluated" || submission?.status === "evaluated";
  const currentPart = task?.parts[partIndex];
  const isLastPart = task ? partIndex === task.parts.length - 1 : false;
  const prepDone = !currentPart || currentPart.prepTimeSeconds === 0 || prepDoneForPart === currentPart.id;

  const handleUpload = useCallback(async () => {
    if (!recorder.audioBlob || !currentPart) return;
    setIsUploading(true);
    try {
      await speakingService.uploadResponse(params.submissionId, currentPart.id, recorder.audioBlob);
      setUploadedParts((prev) => new Set(prev).add(currentPart.id));
    } finally {
      setIsUploading(false);
    }
  }, [recorder.audioBlob, currentPart, params.submissionId]);

  const handleNextPart = () => {
    recorder.reset();
    setPartIndex((i) => i + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const submitted = await speakingService.submit(params.submissionId);
      setResult(submitted);
    } finally {
      setSubmitting(false);
    }
  };

  if (taskLoading || submissionQuery.isLoading) {
    return <p className="text-sm text-text-soft">Loading…</p>;
  }
  if (!task || !submission) {
    return <p className="text-sm text-error">Couldn&apos;t load this submission.</p>;
  }

  const evaluation = result?.evaluation ?? submission.evaluation;

  if (isEvaluated && evaluation) {
    const scoredCriteria = Object.entries(CRITERIA_LABELS).filter(
      ([key]) => evaluation[key as keyof typeof evaluation] !== null
    );
    const unscoredCriteria = Object.entries(CRITERIA_LABELS).filter(
      ([key]) => evaluation[key as keyof typeof evaluation] === null
    );

    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-text-soft">Fluency & Coherence</p>
            <p className="font-display text-6xl font-bold text-primary">
              {evaluation.fluencyCoherence?.toFixed(1) ?? "—"}
            </p>
            <Badge variant="info" className="mt-1">
              Audio-based evaluation
            </Badge>
            <Button className="mt-4" onClick={() => router.push("/student/speaking")}>
              Back to speaking tasks
            </Button>
          </CardContent>
        </Card>

        {unscoredCriteria.length > 0 && (
          <Card>
            <CardContent className="flex items-start gap-3 py-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
              <p className="text-xs text-text-soft">
                <span className="font-medium text-text-muted">
                  {unscoredCriteria.map(([, label]) => label).join(", ")}
                </span>{" "}
                aren&apos;t scored here — they require a transcript (speech-to-text) and, for pronunciation,
                dedicated phonetic analysis, neither of which is wired up in this environment yet. Fluency &
                Coherence is scored directly from your recording&apos;s pacing and pauses.
              </p>
            </CardContent>
          </Card>
        )}

        {scoredCriteria.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Score breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {scoredCriteria.map(([key, label]) => (
                <div key={key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="font-mono text-text-soft">
                      {(evaluation[key as keyof typeof evaluation] as number).toFixed(1)}
                    </span>
                  </div>
                  <ProgressBar value={evaluation[key as keyof typeof evaluation] as number} max={9} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
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

  if (!currentPart) return null;

  const alreadyUploaded = uploadedParts.has(currentPart.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
        <span className="text-sm font-medium">
          Part {currentPart.partNumber} of {task.parts.length}
        </span>
        <span className="text-xs text-text-soft">Target: ~{currentPart.speakTimeSeconds}s</span>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5">
          <p className="text-base font-medium">{currentPart.promptText}</p>

          {currentPart.cueCardPoints && (
            <ul className="flex flex-col gap-1.5 rounded-lg bg-bg-subtle p-4">
              {currentPart.cueCardPoints.map((point, i) => (
                <li key={i} className="text-sm text-text-muted">
                  • {point}
                </li>
              ))}
            </ul>
          )}

          {!prepDone ? (
            <PrepCountdown
              key={currentPart.id}
              seconds={currentPart.prepTimeSeconds}
              onDone={() => setPrepDoneForPart(currentPart.id)}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              {recorder.error && <p className="text-sm text-error">{recorder.error}</p>}

              {!recorder.audioBlob && (
                <Button
                  size="lg"
                  variant={recorder.isRecording ? "danger" : "primary"}
                  onClick={recorder.isRecording ? recorder.stopRecording : recorder.startRecording}
                >
                  {recorder.isRecording ? (
                    <>
                      <Square className="h-4 w-4" /> Stop recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" /> Start recording
                    </>
                  )}
                </Button>
              )}

              {recorder.audioBlob && !alreadyUploaded && (
                <div className="flex w-full flex-col items-center gap-3">
                  <audio
                    ref={audioPreviewRef}
                    src={URL.createObjectURL(recorder.audioBlob)}
                    controls
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={recorder.reset}>
                      <RotateCcw className="h-4 w-4" /> Re-record
                    </Button>
                    <Button size="sm" onClick={handleUpload} isLoading={isUploading}>
                      <Play className="h-4 w-4" /> Save this answer
                    </Button>
                  </div>
                </div>
              )}

              {alreadyUploaded && (
                <div className="flex flex-col items-center gap-3">
                  <Badge variant="success">Answer saved</Badge>
                  {!isLastPart ? (
                    <Button onClick={handleNextPart}>
                      Next part <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} isLoading={submitting}>
                      Submit for evaluation
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PrepCountdown({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onDone();
      return;
    }
    const timeout = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(timeout);
  }, [remaining, onDone]);

  return (
    <div className="flex flex-col items-center gap-2 py-6">
      <p className="font-mono text-xs uppercase tracking-widest text-text-soft">Preparation time</p>
      <p className="font-display text-4xl font-bold text-warning">{remaining}s</p>
    </div>
  );
}
