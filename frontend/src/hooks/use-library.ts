import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { libraryService } from "@/services/library-service";
import type { BookCategory, BookLevel } from "@/types/library";

export function useBooks(filters: { category?: BookCategory; level?: BookLevel; search?: string } = {}) {
  return useQuery({
    queryKey: ["library", "books", filters],
    queryFn: () => libraryService.listBooks(filters),
  });
}

export function useBook(bookId: string) {
  return useQuery({
    queryKey: ["library", "book", bookId],
    queryFn: () => libraryService.getBook(bookId),
    enabled: !!bookId,
  });
}

export function useMyBookProgress(bookId: string) {
  return useQuery({
    queryKey: ["library", "progress", bookId],
    queryFn: () => libraryService.getMyProgress(bookId),
    enabled: !!bookId,
  });
}

export function useToggleFavorite(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => libraryService.toggleFavorite(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "progress", bookId] });
      queryClient.invalidateQueries({ queryKey: ["library", "favorites"] });
    },
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ["library", "favorites"],
    queryFn: libraryService.listFavorites,
  });
}

export function useInProgress() {
  return useQuery({
    queryKey: ["library", "in-progress"],
    queryFn: libraryService.listInProgress,
  });
}
