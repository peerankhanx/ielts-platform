import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types";
import type { Book, BookProgress, InProgressItem, BookCategory, BookLevel } from "@/types/library";

export const libraryService = {
  async listBooks(filters: { category?: BookCategory; level?: BookLevel; search?: string } = {}) {
    const { data } = await apiClient.get<ApiResponse<Book[]>>("/library/books", { params: filters });
    return data.data;
  },

  async getBook(bookId: string) {
    const { data } = await apiClient.get<ApiResponse<Book>>(`/library/books/${bookId}`);
    return data.data;
  },

  async getMyProgress(bookId: string) {
    const { data } = await apiClient.get<ApiResponse<BookProgress | null>>(`/library/books/${bookId}/progress`);
    return data.data;
  },

  async updateProgress(bookId: string, payload: { lastPageRead?: number; isCompleted?: boolean }) {
    const { data } = await apiClient.patch<ApiResponse<BookProgress>>(`/library/books/${bookId}/progress`, payload);
    return data.data;
  },

  async toggleFavorite(bookId: string) {
    const { data } = await apiClient.post<ApiResponse<{ bookId: string; isFavorite: boolean }>>(
      `/library/books/${bookId}/favorite`
    );
    return data.data;
  },

  async listFavorites() {
    const { data } = await apiClient.get<ApiResponse<Book[]>>("/library/favorites");
    return data.data;
  },

  async listInProgress() {
    const { data } = await apiClient.get<ApiResponse<InProgressItem[]>>("/library/in-progress");
    return data.data;
  },
};
