"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { contentAdminService } from "@/services/content-admin-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SpeakingPartInput } from "@/types/content-admin";

function defaultParts(): SpeakingPartInput[] {
  return [
    { partNumber: 1, promptText: "", prepTimeSeconds: 0, speakTimeSeconds: 60 },
    { partNumber: 2, promptText: "", cueCardPoints: ["", ""], prepTimeSeconds: 60, speakTimeSeconds: 120 },
    { partNumber: 3, promptText: "", prepTimeSeconds: 0, speakTimeSeconds: 90 },
  ];
}

export default function NewSpeakingTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [parts, setParts] = useState<SpeakingPartInput[]>(defaultParts());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePart = <K extends keyof SpeakingPartInput>(i: number, field: K, value: SpeakingPartInput[K]) =>
    setParts((p) => p.map((part, idx) => (idx === i ? { ...part, [field]: value } : part)));

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim()) return setError("Give the task a title");
    if (parts.some((p) => !p.promptText.trim())) return setError("Fill in every part's prompt");

    setSubmitting(true);
    try {
      await contentAdminService.createSpeakingTask({
        title,
        description,
        parts: parts.map((p) => ({
          ...p,
          cueCardPoints: p.cueCardPoints?.filter((c) => c.trim() !== ""),
        })),
      });
      router.push("/admin/content");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-16">
      <div>
        <h1 className="font-display text-2xl font-bold">New Speaking task</h1>
        <p className="mt-1 text-sm text-text-soft">Created as a draft — publish it from the content page when ready.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </CardContent>
      </Card>

      {parts.map((part, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>Part {part.partNumber}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Input
              label="Prompt"
              value={part.promptText}
              onChange={(e) => updatePart(i, "promptText", e.target.value)}
            />

            {part.partNumber === 2 && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">Cue card points (comma-separated)</label>
                <Input
                  value={(part.cueCardPoints ?? []).join(", ")}
                  onChange={(e) => updatePart(i, "cueCardPoints", e.target.value.split(",").map((s) => s.trim()))}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {part.partNumber === 2 && (
                <Input
                  label="Prep time (seconds)"
                  type="number"
                  value={part.prepTimeSeconds}
                  onChange={(e) => updatePart(i, "prepTimeSeconds", Number(e.target.value))}
                />
              )}
              <Input
                label="Speak time (seconds)"
                type="number"
                value={part.speakTimeSeconds}
                onChange={(e) => updatePart(i, "speakTimeSeconds", Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {error && <p className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/admin/content")}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} isLoading={submitting}>
          Create task
        </Button>
      </div>
    </div>
  );
}
