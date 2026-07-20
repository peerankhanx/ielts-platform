import { useMutation, useQuery } from "@tanstack/react-query";
import { speakingService } from "@/services/speaking-service";

export function useSpeakingTasks() {
  return useQuery({
    queryKey: ["speaking", "tasks"],
    queryFn: speakingService.listTasks,
  });
}

export function useSpeakingTask(taskId: string) {
  return useQuery({
    queryKey: ["speaking", "task", taskId],
    queryFn: () => speakingService.getTask(taskId),
    enabled: !!taskId,
  });
}

export function useStartSpeakingSubmission(taskId: string) {
  return useMutation({
    mutationFn: () => speakingService.startSubmission(taskId),
  });
}
