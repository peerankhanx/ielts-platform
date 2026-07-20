export type BookCategory = "grammar" | "vocabulary" | "reading" | "writing" | "listening" | "speaking" | "general";
export type BookLevel = "beginner" | "intermediate" | "advanced";

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: BookCategory;
  level: BookLevel;
  pageCount: number;
  fileUrl: string;
}

export interface BookProgress {
  id: string;
  bookId: string;
  lastPageRead: number;
  isFavorite: boolean;
  isCompleted: boolean;
}

export interface InProgressItem {
  book: Book;
  lastPageRead: number;
}
