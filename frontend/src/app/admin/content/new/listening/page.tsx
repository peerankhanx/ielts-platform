"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, CheckCircle2 } from "lucide-react";
import { contentAdminService } from "@/services/content-admin-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SectionInput, QuestionInput, QuestionType } from "@/types/content-admin";
import type { ListeningTestCreateResult } from "@/types/content-admin";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "true_false_not_given", label: "True / False / Not Given" },
  { value: "short_answer", label: "Short answer" },
  { value: "matching_heading", label: "Matching heading" },
];

export default function NewListeningTestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [sections, setSections] = useState<SectionInput[]>([{ orderIndex: 1, title: "" }]);
  const [questions, setQuestions] = useState<QuestionInput[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<ListeningTestCreateResult | null>(null);
  const [uploadedSectionIds, setUploadedSectionIds] = useState<Set<string>>(new Set());

  const addSection = () => setSections((s) => [...s, { orderIndex: s.length + 1, title: "" }]);
  const removeSection = (i: number) => setSections((s) => s.filter((_, idx) => idx !== i));
  const updateSection = (i: number, title: string) =>
    setSections((s) => s.map((sec, idx) => (idx === i ? { ...sec, title } : sec)));

  const addQuestion = () =>
    setQuestions((q) => [
      ...q,
      { sectionIndex: 0, orderIndex: q.length + 1, type: "multiple_choice", promptText: "", options: ["", ""], correctAnswer: "" },
    ]);
  const removeQuestion = (i: number) => setQuestions((q) => q.filter((_, idx) => idx !== i));
  const updateQuestion = <K extends keyof QuestionInput>(i: number, field: K, value: QuestionInput[K]) =>
    setQuestions((q) => q.map((question, idx) => (idx === i ? { ...question, [field]: value } : question)));

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim()) return setError("Give the test a title");
    if (sections.some((s) => !s.title.trim())) return setError("Fill in every section title");
    if (questions.length === 0) return setError("Add at least one question");

    setSubmitting(true);
    try {
      const result = await contentAdminService.createListeningTest({
        title,
        description,
        timeLimitMinutes,
        sections,
        questions: questions.map((q) => ({
          ...q,
          correctAnswer:
            q.type === "short_answer" && typeof q.correctAnswer === "string"
              ? q.correctAnswer.split(",").map((s) => s.trim())
              : q.correctAnswer,
        })),
      });
      setCreated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create test");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAudioUpload = async (sectionId: string, file: File) => {
    await contentAdminService.uploadSectionAudio(sectionId, file);
    setUploadedSectionIds((prev) => new Set(prev).add(sectionId));
  };

  if (created) {
    const allUploaded = created.sections.every((s) => uploadedSectionIds.has(s.id));
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload audio for each section</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {created.sections.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <span className="text-sm font-medium">{s.title}</span>
                {uploadedSectionIds.has(s.id) ? (
                  <span className="flex items-center gap-1.5 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" /> Uploaded
                  </span>
                ) : (
                  <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-bg-subtle">
                    <Upload className="h-4 w-4" /> Upload audio
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleAudioUpload(s.id, e.target.files[0])}
                    />
                  </label>
                )}
              </div>
            ))}
            <Button className="mt-2" disabled={!allUploaded} onClick={() => router.push("/admin/content")}>
              {allUploaded ? "Done — back to content" : "Upload all sections to continue"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-16">
      <div>
        <h1 className="font-display text-2xl font-bold">New Listening test</h1>
        <p className="mt-1 text-sm text-text-soft">
          Created as a draft — you&apos;ll upload audio for each section next, then publish from the content page.
        </p>
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
          <CardTitle>Sections</CardTitle>
          <Button size="sm" variant="outline" onClick={addSection}>
            <Plus className="h-4 w-4" /> Add section
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {sections.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <Input
                label={i === 0 ? "Section title" : undefined}
                value={s.title}
                onChange={(e) => updateSection(i, e.target.value)}
                className="flex-1"
              />
              {sections.length > 1 && (
                <button onClick={() => removeSection(i)} className="mt-auto text-text-soft hover:text-error">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
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
                    <label className="mb-1.5 block text-sm font-medium">Section</label>
                    <select
                      value={q.sectionIndex}
                      onChange={(e) => updateQuestion(i, "sectionIndex", Number(e.target.value))}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    >
                      {sections.map((s, si) => (
                        <option key={si} value={si}>
                          {s.title || `Section ${si + 1}`}
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
                  label={q.type === "short_answer" ? "Acceptable answers (comma-separated)" : "Correct answer"}
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
          Create test &amp; continue to audio upload
        </Button>
      </div>
    </div>
  );
}
