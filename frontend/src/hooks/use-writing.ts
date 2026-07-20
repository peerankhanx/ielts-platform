import { useMutation, useQuery } from "@tanstack/react-query";
import { writingService } from "@/services/writing-service";

export function useWritingTasks() {
  return useQuery({
    queryKey: ["writing", "tasks"],
    queryFn: writingService.listTasks,
  });
}

export function useWritingTask(taskId: string) {
  return useQuery({
    queryKey: ["writing", "task", taskId],
    queryFn: () => writingService.getTask(taskId),
    enabled: !!taskId,
  });
}

export function useStartWritingSubmission(taskId: string) {
  return useMutation({
    mutationFn: () => writingService.startSubmission(taskId),
  });
}
