"use client";

import Link from "next/link";
import { BookOpen, Headphones, PenLine, Mic, Plus, Trash2 } from "lucide-react";
import {
  useAdminReadingTests,
  useAdminListeningTests,
  useAdminWritingTasks,
  useAdminSpeakingTasks,
  useToggleTestPublish,
  useDeleteTest,
  useToggleWritingPublish,
  useDeleteWritingTask,
  useToggleSpeakingPublish,
  useDeleteSpeakingTask,
} from "@/hooks/use-content-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";

export default function AdminContentPage() {
  const readingTests = useAdminReadingTests();
  const listeningTests = useAdminListeningTests();
  const writingTasks = useAdminWritingTasks();
  const speakingTasks = useAdminSpeakingTasks();

  const toggleTestPublish = useToggleTestPublish();
  const deleteTest = useDeleteTest();
  const toggleWritingPublish = useToggleWritingPublish();
  const deleteWritingTask = useDeleteWritingTask();
  const toggleSpeakingPublish = useToggleSpeakingPublish();
  const deleteSpeakingTask = useDeleteSpeakingTask();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Content</h1>
          <p className="mt-1 text-sm text-text-soft">Author and manage test content across all modules.</p>
        </div>
      </div>

      {/* Reading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> Reading tests
          </CardTitle>
          <Link href="/admin/content/new/reading">
            <Button size="sm">
              <Plus className="h-4 w-4" /> New test
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {readingTests.isLoading && <p className="py-3 text-sm text-text-soft">Loading…</p>}
          {readingTests.data?.length === 0 && <p className="py-3 text-sm text-text-soft">No reading tests yet.</p>}
          {readingTests.data?.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{t.title}</p>
                <p className="text-xs text-text-soft">{t.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={t.isPublished ? "success" : "warning"}>
                  {t.isPublished ? "Published" : "Draft"}
                </Badge>
                <Link href={`/admin/content/edit/reading/${t.id}`}>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleTestPublish.mutate({ testId: t.id, isPublished: !t.isPublished })}
                >
                  {t.isPublished ? "Unpublish" : "Publish"}
                </Button>
                <button
                  onClick={() => confirm(`Delete "${t.title}"?`) && deleteTest.mutate(t.id)}
                  className="rounded-lg p-2 text-text-soft hover:bg-error/10 hover:text-error"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Listening */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-primary" /> Listening tests
          </CardTitle>
          <Link href="/admin/content/new/listening">
            <Button size="sm">
              <Plus className="h-4 w-4" /> New test
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {listeningTests.isLoading && <p className="py-3 text-sm text-text-soft">Loading…</p>}
          {listeningTests.data?.length === 0 && <p className="py-3 text-sm text-text-soft">No listening tests yet.</p>}
          {listeningTests.data?.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{t.title}</p>
                <p className="text-xs text-text-soft">{t.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={t.isPublished ? "success" : "warning"}>
                  {t.isPublished ? "Published" : "Draft"}
                </Badge>
                <Link href={`/admin/content/edit/listening/${t.id}`}>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleTestPublish.mutate({ testId: t.id, isPublished: !t.isPublished })}
                >
                  {t.isPublished ? "Unpublish" : "Publish"}
                </Button>
                <button
                  onClick={() => confirm(`Delete "${t.title}"?`) && deleteTest.mutate(t.id)}
                  className="rounded-lg p-2 text-text-soft hover:bg-error/10 hover:text-error"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Writing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLine className="h-4 w-4 text-primary" /> Writing tasks
          </CardTitle>
          <Link href="/admin/content/new/writing">
            <Button size="sm">
              <Plus className="h-4 w-4" /> New task
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {writingTasks.isLoading && <p className="py-3 text-sm text-text-soft">Loading…</p>}
          {writingTasks.data?.length === 0 && <p className="py-3 text-sm text-text-soft">No writing tasks yet.</p>}
          {writingTasks.data?.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <p className="text-sm font-medium">{t.title}</p>
              <div className="flex items-center gap-2">
                <Badge variant={t.isPublished ? "success" : "warning"}>
                  {t.isPublished ? "Published" : "Draft"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleWritingPublish.mutate({ taskId: t.id, isPublished: !t.isPublished })}
                >
                  {t.isPublished ? "Unpublish" : "Publish"}
                </Button>
                <button
                  onClick={() => confirm(`Delete "${t.title}"?`) && deleteWritingTask.mutate(t.id)}
                  className="rounded-lg p-2 text-text-soft hover:bg-error/10 hover:text-error"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Speaking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-primary" /> Speaking tasks
          </CardTitle>
          <Link href="/admin/content/new/speaking">
            <Button size="sm">
              <Plus className="h-4 w-4" /> New task
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {speakingTasks.isLoading && <p className="py-3 text-sm text-text-soft">Loading…</p>}
          {speakingTasks.data?.length === 0 && <p className="py-3 text-sm text-text-soft">No speaking tasks yet.</p>}
          {speakingTasks.data?.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <p className="text-sm font-medium">{t.title}</p>
              <div className="flex items-center gap-2">
                <Badge variant={t.isPublished ? "success" : "warning"}>
                  {t.isPublished ? "Published" : "Draft"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleSpeakingPublish.mutate({ taskId: t.id, isPublished: !t.isPublished })}
                >
                  {t.isPublished ? "Unpublish" : "Publish"}
                </Button>
                <button
                  onClick={() => confirm(`Delete "${t.title}"?`) && deleteSpeakingTask.mutate(t.id)}
                  className="rounded-lg p-2 text-text-soft hover:bg-error/10 hover:text-error"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
