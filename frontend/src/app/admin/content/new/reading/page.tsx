"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { contentAdminService } from "@/services/content-admin-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PassageInput, QuestionInput, QuestionType } from "@/types/content-admin";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "true_false_not_given", label: "True / False / Not Given" },
  { value: "short_answer", label: "Short answer" },
  { value: "matching_heading", label: "Matching heading" },
];

export default function NewReadingTestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(60);
  const [passages, setPassages] = useState<PassageInput[]>([{ orderIndex: 1, title: "", content: "" }]);
  const [questions, setQuestions] = useState<QuestionInput[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPassage = () => setPassages((p) => [...p, { orderIndex: p.length + 1, title: "", content: "" }]);
  const removePassage = (i: number) => setPassages((p) => p.filter((_, idx) => idx !== i));
  const updatePassage = (i: number, field: keyof PassageInput, value: string) =>
    setPassages((p) => p.map((passage, idx) => (idx === i ? { ...passage, [field]: value } : passage)));

  const addQuestion = () =>
    setQuestions((q) => [
      ...q,
      {
        passageIndex: 0,
        orderIndex: q.length + 1,
        type: "multiple_choice",
        promptText: "",
        options: ["", ""],
        correctAnswer: "",
      },
    ]);
  const removeQuestion = (i: number) => setQuestions((q) => q.filter((_, idx) => idx !== i));
  const updateQuestion = <K extends keyof QuestionInput>(i: number, field: K, value: QuestionInput[K]) =>
    setQuestions((q) => q.map((question, idx) => (idx === i ? { ...question, [field]: value } : question)));

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim()) return setError("Give the test a title");
    if (passages.some((p) => !p.title.trim() || !p.content.trim())) return setError("Fill in every passage");
    if (questions.length === 0) return setError("Add at least one question");
    if (questions.some((q) => !q.promptText.trim())) return setError("Fill in every question prompt");

    setSubmitting(true);
    try {
      await contentAdminService.createReadingTest({
        title,
        description,
        timeLimitMinutes,
        passages,
        questions: questions.map((q) => ({
          ...q,
          correctAnswer:
            q.type === "short_answer" && typeof q.correctAnswer === "string"
              ? q.correctAnswer.split(",").map((s) => s.trim())
              : q.correctAnswer,
        })),
      });
      router.push("/admin/content");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create test");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-16">
      <div>
        <h1 className="font-display text-2xl font-bold">New Reading test</h1>
        <p className="mt-1 text-sm text-text-soft">Created as a draft — publish it from the content page when ready.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input
            label="Time limit (minutes)"
            type="number"
            value={timeLimitMinutes}
            onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Passages</CardTitle>
          <Button size="sm" variant="outline" onClick={addPassage}>
            <Plus className="h-4 w-4" /> Add passage
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {passages.map((p, i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-text-soft">Passage {i + 1}</span>
                {passages.length > 1 && (
                  <button onClick={() => removePassage(i)} className="text-text-soft hover:text-error">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Input
                  label="Passage title"
                  value={p.title}
                  onChange={(e) => updatePassage(i, "title", e.target.value)}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Passage text</label>
                  <textarea
                    value={p.content}
                    onChange={(e) => updatePassage(i, "content", e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <Button size="sm" variant="outline" onClick={addQuestion}>
            <Plus className="h-4 w-4" /> Add question
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {questions.length === 0 && <p className="text-sm text-text-soft">No questions yet.</p>}
          {questions.map((q, i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-text-soft">Question {i + 1}</span>
                <button onClick={() => removeQuestion(i)} className="text-text-soft hover:text-error">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Passage</label>
                    <select
                      value={q.passageIndex}
                      onChange={(e) => updateQuestion(i, "passageIndex", Number(e.target.value))}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    >
                      {passages.map((p, pi) => (
                        <option key={pi} value={pi}>
                          {p.title || `Passage ${pi + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Type</label>
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestion(i, "type", e.target.value as QuestionType)}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Question prompt"
                  value={q.promptText}
                  onChange={(e) => updateQuestion(i, "promptText", e.target.value)}
                />

                {(q.type === "multiple_choice" || q.type === "matching_heading") && (
                  <Input
                    label="Options (comma-separated)"
                    value={(q.options ?? []).join(", ")}
                    onChange={(e) => updateQuestion(i, "options", e.target.value.split(",").map((s) => s.trim()))}
                  />
                )}

                <Input
                  label={
                    q.type === "short_answer"
                      ? "Acceptable answers (comma-separated)"
                      : q.type === "true_false_not_given"
                        ? "Correct answer (TRUE / FALSE / NOT GIVEN)"
                        : "Correct answer (must match one option exactly)"
                  }
                  value={Array.isArray(q.correctAnswer) ? q.correctAnswer.join(", ") : q.correctAnswer}
                  onChange={(e) => updateQuestion(i, "correctAnswer", e.target.value)}
                />

                <Input
                  label="Explanation (optional)"
                  value={q.explanation ?? ""}
                  onChange={(e) => updateQuestion(i, "explanation", e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && <p className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/admin/content")}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} isLoading={submitting}>
          Create test
        </Button>
      </div>
    </div>
  );
}
