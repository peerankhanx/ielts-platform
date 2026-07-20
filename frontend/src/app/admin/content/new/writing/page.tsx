"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { contentAdminService } from "@/services/content-admin-service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewWritingTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState<"task_1" | "task_2">("task_2");
  const [promptText, setPromptText] = useState("");
  const [minWords, setMinWords] = useState(250);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(40);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim() || !promptText.trim()) return setError("Fill in the title and prompt");

    setSubmitting(true);
    try {
      await contentAdminService.createWritingTask({ title, taskType, promptText, minWords, timeLimitMinutes });
      router.push("/admin/content");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">New Writing task</h1>
        <p className="mt-1 text-sm text-text-soft">Created as a draft — publish it from the content page when ready.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

          <div>
            <label className="mb-1.5 block text-sm font-medium">Task type</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as "task_1" | "task_2")}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="task_1">Task 1 (report/chart description)</option>
              <option value="task_2">Task 2 (essay)</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Prompt</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum words"
              type="number"
              value={minWords}
              onChange={(e) => setMinWords(Number(e.target.value))}
            />
            <Input
              label="Time limit (minutes)"
              type="number"
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

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
