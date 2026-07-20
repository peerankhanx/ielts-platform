"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Save } from "lucide-react";
import { contentAdminService } from "@/services/content-admin-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/progress-bar";
import type { AdminPassage, AdminQuestion, QuestionType } from "@/types/content-admin";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "true_false_not_given", label: "True / False / Not Given" },
  { value: "short_answer", label: "Short answer" },
  { value: "matching_heading", label: "Matching heading" },
];

export default function EditReadingTestPage() {
  const params = useParams<{ testId: string }>()!;
  const router = useRouter();

  const testQuery = useQuery({
    queryKey: ["admin", "content", "reading-test-full", params.testId],
    queryFn: () => contentAdminService.getReadingTestFull(params.testId),
  });

  const [testTitle, setTestTitle] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [passages, setPassages] = useState<AdminPassage[]>([]);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const hydrated = useRef(false);

  // Hydrate local editable state once with whatever's already loaded.
  useEffect(() => {
    if (testQuery.data && !hydrated.current) {
      hydrated.current = true;
      setTestTitle(testQuery.data.test.title);
      setIsPublished(testQuery.data.test.isPublished);
      setPassages(testQuery.data.passages);
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

  const updatePassageField = (id: string, field: keyof AdminPassage, value: string | number) =>
    setPassages((ps) => ps.map((p) => (p.id === id ? { ...p, [field]: value } : p)));

  const savePassage = (passage: AdminPassage) =>
    withSaving(passage.id, async () => {
      await contentAdminService.updatePassage(passage.id, {
        title: passage.title,
        content: passage.content,
      });
    });

  const deletePassage = async (passageId: string) => {
    if (!confirm("Delete this passage? Questions linked to it will need reassigning first.")) return;
    await contentAdminService.deletePassage(passageId);
    setPassages((ps) => ps.filter((p) => p.id !== passageId));
  };

  const addPassage = async () => {
    const created = await contentAdminService.addPassage(params.testId, {
      orderIndex: passages.length + 1,
      title: "New passage",
      content: "",
    });
    setPassages((ps) => [...ps, created]);
  };

  const updateQuestionField = <K extends keyof AdminQuestion>(id: string, field: K, value: AdminQuestion[K]) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, [field]: value } : q)));

  const saveQuestion = (question: AdminQuestion) =>
    withSaving(question.id, async () => {
      await contentAdminService.updateQuestion(question.id, {
        passageId: question.passageId,
        sectionId: null,
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
    if (passages.length === 0) return alert("Add a passage first");
    const created = await contentAdminService.addReadingQuestion(params.testId, {
      passageId: passages[0].id,
      sectionId: null,
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
          <CardTitle>Passages</CardTitle>
          <Button size="sm" variant="outline" onClick={addPassage}>
            <Plus className="h-4 w-4" /> Add passage
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {passages.map((p) => (
            <div key={p.id} className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-text-soft">Passage (order {p.orderIndex})</span>
                <div className="flex items-center gap-2">
                  {savingIds.has(p.id) && <span className="text-[10px] text-text-soft">saving…</span>}
                  <button onClick={() => savePassage(p)} className="text-text-soft hover:text-primary">
                    <Save className="h-4 w-4" />
                  </button>
                  <button onClick={() => deletePassage(p.id)} className="text-text-soft hover:text-error">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Input value={p.title} onChange={(e) => updatePassageField(p.id, "title", e.target.value)} />
                <textarea
                  value={p.content}
                  onChange={(e) => updatePassageField(p.id, "content", e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
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
                    <label className="mb-1.5 block text-sm font-medium">Passage</label>
                    <select
                      value={q.passageId ?? ""}
                      onChange={(e) => updateQuestionField(q.id, "passageId", e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    >
                      {passages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
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
