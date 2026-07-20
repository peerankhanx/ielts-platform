"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, CheckCircle2, Download } from "lucide-react";
import { useBook, useMyBookProgress, useToggleFavorite } from "@/hooks/use-library";
import { libraryService } from "@/services/library-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "http://localhost:4000";

export default function BookDetailPage() {
  const params = useParams<{ bookId: string }>()!;
  const queryClient = useQueryClient();
  const { data: book, isLoading, isError } = useBook(params.bookId);
  const { data: progress } = useMyBookProgress(params.bookId);
  const toggleFavorite = useToggleFavorite(params.bookId);

  const [markingComplete, setMarkingComplete] = useState(false);
  const hasRecordedOpen = useRef(false);
  const isCompleted = progress?.isCompleted ?? false;

  // Best-effort: record that the student opened this book (page 1), since
  // there's no reliable client-side way to detect actual PDF scroll
  // position from a plain <iframe> viewer. A ref (not state) guards this
  // firing more than once, so the effect never calls setState itself.
  useEffect(() => {
    if (book && !hasRecordedOpen.current) {
      hasRecordedOpen.current = true;
      void libraryService.updateProgress(params.bookId, { lastPageRead: 1 });
    }
  }, [book, params.bookId]);

  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    try {
      await libraryService.updateProgress(params.bookId, { isCompleted: true });
      await queryClient.invalidateQueries({ queryKey: ["library", "progress", params.bookId] });
    } finally {
      setMarkingComplete(false);
    }
  };

  if (isLoading) return <p className="text-sm text-text-soft">Loading book…</p>;
  if (isError || !book) return <p className="text-sm text-error">Couldn&apos;t load this book.</p>;

  const fileUrl = `${MEDIA_BASE_URL}${book.fileUrl}`;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <Card>
        <CardContent className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="info">{book.level}</Badge>
              <Badge variant="default">{book.category}</Badge>
              {isCompleted && (
                <Badge variant="success">
                  <CheckCircle2 className="mr-1 inline h-3 w-3" /> Completed
                </Badge>
              )}
            </div>
            <h1 className="font-display text-2xl font-bold">{book.title}</h1>
            <p className="mt-1 text-sm text-text-soft">
              {book.author} · {book.pageCount} pages
            </p>
            <p className="mt-3 max-w-2xl text-sm text-text-muted">{book.description}</p>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleFavorite.mutate()}
              isLoading={toggleFavorite.isPending}
            >
              <Heart className={cn("h-4 w-4", progress?.isFavorite && "fill-error text-error")} />
              {progress?.isFavorite ? "Favorited" : "Favorite"}
            </Button>
            <a href={fileUrl} download>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" /> Download
              </Button>
            </a>
            {!isCompleted && (
              <Button size="sm" onClick={handleMarkComplete} isLoading={markingComplete}>
                Mark as read
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <iframe src={fileUrl} title={book.title} className="h-[75vh] w-full" />
      </Card>
    </div>
  );
}
