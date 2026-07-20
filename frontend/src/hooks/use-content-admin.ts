import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contentAdminService } from "@/services/content-admin-service";

export function useAdminReadingTests() {
  return useQuery({ queryKey: ["admin", "content", "reading"], queryFn: contentAdminService.listReadingTests });
}
export function useAdminListeningTests() {
  return useQuery({ queryKey: ["admin", "content", "listening"], queryFn: contentAdminService.listListeningTests });
}
export function useAdminWritingTasks() {
  return useQuery({ queryKey: ["admin", "content", "writing"], queryFn: contentAdminService.listWritingTasks });
}
export function useAdminSpeakingTasks() {
  return useQuery({ queryKey: ["admin", "content", "speaking"], queryFn: contentAdminService.listSpeakingTasks });
}

export function useToggleTestPublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ testId, isPublished }: { testId: string; isPublished: boolean }) =>
      contentAdminService.toggleTestPublish(testId, isPublished),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "content"] }),
  });
}
export function useDeleteTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (testId: string) => contentAdminService.deleteTest(testId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "content"] }),
  });
}
export function useToggleWritingPublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, isPublished }: { taskId: string; isPublished: boolean }) =>
      contentAdminService.toggleWritingTaskPublish(taskId, isPublished),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "content"] }),
  });
}
export function useDeleteWritingTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => contentAdminService.deleteWritingTask(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "content"] }),
  });
}
export function useToggleSpeakingPublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, isPublished }: { taskId: string; isPublished: boolean }) =>
      contentAdminService.toggleSpeakingTaskPublish(taskId, isPublished),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "content"] }),
  });
}
export function useDeleteSpeakingTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => contentAdminService.deleteSpeakingTask(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "content"] }),
  });
}
