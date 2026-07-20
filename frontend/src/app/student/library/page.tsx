"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Search, Heart } from "lucide-react";
import { useBooks, useFavorites, useInProgress } from "@/hooks/use-library";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/progress-bar";
import { Input } from "@/components/ui/input";
import type { BookCategory, BookLevel } from "@/types/library";

const CATEGORIES: { value: BookCategory | ""; label: string }[] = [
  { value: "", label: "All categories" },
  { value: "grammar", label: "Grammar" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "reading", label: "Reading" },
  { value: "writing", label: "Writing" },
  { value: "listening", label: "Listening" },
  { value: "speaking", label: "Speaking" },
  { value: "general", label: "General" },
];

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<BookCategory | "">("");
  const [level, setLevel] = useState<BookLevel | "">("");

  const { data: books, isLoading, isError } = useBooks({
    search: search || undefined,
    category: category || undefined,
    level: level || undefined,
  });
  const { data: inProgress } = useInProgress();
  const { data: favorites } = useFavorites();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Books &amp; Library</h1>
        <p className="mt-1 text-sm text-text-soft">Grammar guides, vocabulary lists, and reference material.</p>
      </div>

      {inProgress && inProgress.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">Continue reading</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {inProgress.map((item) => (
              <Link key={item.book.id} href={`/student/library/${item.book.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.book.title}</p>
                      <p className="text-xs text-text-soft">
                        Page {item.lastPageRead} of {item.book.pageCount}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {favorites && favorites.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
            <Heart className="h-4 w-4 text-error" /> Favorites
          </h2>
          <div className="flex flex-wrap gap-2">
            {favorites.map((book) => (
              <Link key={book.id} href={`/student/library/${book.id}`}>
                <Badge variant="info">{book.title}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-soft" />
          <Input
            placeholder="Search by title or author…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as BookCategory | "")}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as BookLevel | "")}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {isLoading && <p className="text-sm text-text-soft">Loading books…</p>}
      {isError && <p className="text-sm text-error">Couldn&apos;t load the library.</p>}
      {books && books.length === 0 && <p className="text-sm text-text-soft">No books match your filters.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books?.map((book) => (
          <Link key={book.id} href={`/student/library/${book.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex h-full flex-col gap-3">
                <div className="flex items-center justify-between">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <Badge variant="info">{book.level}</Badge>
                </div>
                <h3 className="font-display text-base font-semibold">{book.title}</h3>
                <p className="text-xs text-text-soft">{book.author}</p>
                <p className="flex-1 text-sm text-text-soft line-clamp-3">{book.description}</p>
                <div className="flex items-center justify-between text-xs text-text-soft">
                  <span className="capitalize">{book.category}</span>
                  <span>{book.pageCount} pages</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
