"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Save, Upload, CheckCircle2 } from "lucide-react";
import { contentAdminService } from "@/services/content-admin-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/progress-bar";
import type { AdminSection, AdminQuestion, QuestionType } from "@/types/content-admin";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "true_false_not_given", label: "True / False / Not Given" },
  { value: "short_answer", label: "Short answer" },
  { value: "matching_heading", label: "Matching heading" },
];

export default function EditListeningTestPage() {
  const params = useParams<{ testId: string }>()!;
  const router = useRouter();

  const testQuery = useQuery({
    queryKey: ["admin", "content", "listening-test-full", params.testId],
    queryFn: () => contentAdminService.getListeningTestFull(params.testId),
  });

  const [testTitle, setTestTitle] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [sections, setSections] = useState<AdminSection[]>([]);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const hydrated = useRef(false);

  useEffect(() => {
    if (testQuery.data && !hydrated.current) {
      hydrated.current = true;
      setTestTitle(testQuery.data.test.title);
      setIsPublished(testQuery.data.test.isPublished);
      setSections(testQuery.data.sections);
      setQuestions(testQuery.data.questions);
    }
  }, [testQuery.data]);

  const withSaving = async (id: string, fn: () => Promise<void>) => {
    setSavingIds((s) => new Set(s).add(id));
    try {
      await fn();
    } finally {
      setSavingIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  };

  const updateSectionField = (id: string, title: string) =>
    setSections((ss) => ss.map((s) => (s.id === id ? { ...s, title } : s)));

  const saveSection = (section: AdminSection) =>
    withSaving(section.id, async () => {
      await contentAdminService.updateSection(section.id, { title: section.title });
    });

  const deleteSection = async (sectionId: string) => {
    if (!confirm("Delete this section? Questions linked to it will need reassigning first.")) return;
    await contentAdminService.deleteSection(sectionId);
    setSections((ss) => ss.filter((s) => s.id !== sectionId));
  };

  const addSection = async () => {
    const created = await contentAdminService.addSection(params.testId, {
      orderIndex: sections.length + 1,
      title: "New section",
    });
    setSections((ss) => [...ss, { ...created, audioUrl: "" }]);
  };

  const handleAudioUpload = async (sectionId: string, file: File) => {
    setUploadingIds((s) => new Set(s).add(sectionId));
    try {
      await contentAdminService.uploadSectionAudio(sectionId, file);
      setSections((ss) => ss.map((s) => (s.id === sectionId ? { ...s, audioUrl: "uploaded" } : s)));
    } finally {
      setUploadingIds((s) => {
        const next = new Set(s);
        next.delete(sectionId);
        return next;
      });
    }
  };

  const updateQuestionField = <K extends keyof AdminQuestion>(id: string, field: K, value: AdminQuestion[K]) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, [field]: value } : q)));

  const saveQuestion = (question: AdminQuestion) =>
    withSaving(question.id, async () => {
      await contentAdminService.updateQuestion(question.id, {
        passageId: null,
        sectionId: question.sectionId,
        orderIndex: question.orderIndex,
        type: question.type,
        promptText: question.promptText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        points: question.points,
        explanation: question.explanation,
      });
    });

  const deleteQuestion = async (questionId: string) => {
    if (!confirm("Delete this question?")) return;
    await contentAdminService.deleteQuestion(questionId);
    setQuestions((qs) => qs.filter((q) => q.id !== questionId));
  };

  const addQuestion = async () => {
    if (sections.length === 0) return alert("Add a section first");
    const created = await contentAdminService.addListeningQuestion(params.testId, {
      passageId: null,
      sectionId: sections[0].id,
      orderIndex: questions.length + 1,
      type: "multiple_choice",
      promptText: "New question",
      options: ["", ""],
      correctAnswer: "",
      points: 1,
      explanation: null,
    });
    setQuestions((qs) => [...qs, created]);
  };

  const togglePublish = async () => {
    await contentAdminService.toggleTestPublish(params.testId, !isPublished);
    setIsPublished((p) => !p);
  };

  if (testQuery.isLoading) return <p className="text-sm text-text-soft">Loading test…</p>;
  if (testQuery.isError) return <p className="text-sm text-error">Couldn&apos;t load this test.</p>;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{testTitle}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={isPublished ? "success" : "warning"}>{isPublished ? "Published" : "Draft"}</Badge>
            <Button size="sm" variant="outline" onClick={togglePublish}>
              {isPublished ? "Unpublish" : "Publish"}
            </Button>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/content")}>
          Back to content
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sections</CardTitle>
          <Button size="sm" variant="outline" onClick={addSection}>
            <Plus className="h-4 w-4" /> Add section
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {sections.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border p-4">
              <Input
                value={s.title}
                onChange={(e) => updateSectionField(s.id, e.target.value)}
                className="flex-1"
              />
              {savingIds.has(s.id) && <span className="text-[10px] text-text-soft">saving…</span>}
              <button onClick={() => saveSection(s)} className="text-text-soft hover:text-primary">
                <Save className="h-4 w-4" />
              </button>

              {s.audioUrl ? (
                <span className="flex items-center gap-1.5 text-xs text-success">
                  <CheckCircle2 className="h-4 w-4" /> Audio set
                </span>
              ) : uploadingIds.has(s.id) ? (
                <span className="text-xs text-text-soft">uploading…</span>
              ) : (
                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-bg-subtle">
                  <Upload className="h-4 w-4" /> Upload audio
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleAudioUpload(s.id, e.target.files[0])}
                  />
                </label>
              )}

              <button onClick={() => deleteSection(s.id)} className="text-text-soft hover:text-error">
                <Trash2 className="h-4 w-4" />
              </button>
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
          {questions.map((q) => (
            <div key={q.id} className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-text-soft">Question (order {q.orderIndex})</span>
                <div className="flex items-center gap-2">
                  {savingIds.has(q.id) && <span className="text-[10px] text-text-soft">saving…</span>}
                  <button onClick={() => saveQuestion(q)} className="text-text-soft hover:text-primary">
                    <Save className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteQuestion(q.id)} className="text-text-soft hover:text-error">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Section</label>
                    <select
                      value={q.sectionId ?? ""}
                      onChange={(e) => updateQuestionField(q.id, "sectionId", e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    >
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Type</label>
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestionField(q.id, "type", e.target.value as QuestionType)}
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
                  label="Prompt"
                  value={q.promptText}
                  onChange={(e) => updateQuestionField(q.id, "promptText", e.target.value)}
                />

                {(q.type === "multiple_choice" || q.type === "matching_heading") && (
                  <Input
                    label="Options (comma-separated)"
                    value={(q.options ?? []).join(", ")}
                    onChange={(e) =>
                      updateQuestionField(q.id, "options", e.target.value.split(",").map((s) => s.trim()))
                    }
                  />
                )}

                <Input
                  label={q.type === "short_answer" ? "Acceptable answers (comma-separated)" : "Correct answer"}
                  value={Array.isArray(q.correctAnswer) ? q.correctAnswer.join(", ") : q.correctAnswer}
                  onChange={(e) =>
                    updateQuestionField(
                      q.id,
                      "correctAnswer",
                      q.type === "short_answer" ? e.target.value.split(",").map((s) => s.trim()) : e.target.value
                    )
                  }
                />

                <Input
                  label="Explanation"
                  value={q.explanation ?? ""}
                  onChange={(e) => updateQuestionField(q.id, "explanation", e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
