import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { readingService } from "@/services/reading-service";

export function useReadingTests() {
  return useQuery({
    queryKey: ["reading", "tests"],
    queryFn: readingService.listTests,
  });
}

export function useReadingTest(testId: string) {
  return useQuery({
    queryKey: ["reading", "test", testId],
    queryFn: () => readingService.getTest(testId),
    enabled: !!testId,
  });
}

export function useStartAttempt(testId: string) {
  return useMutation({
    mutationFn: () => readingService.startAttempt(testId),
  });
}

export function useSaveAnswer(attemptId: string) {
  return useMutation({
    mutationFn: ({ questionId, responseValue }: { questionId: string; responseValue: string | null }) =>
      readingService.saveAnswer(attemptId, questionId, responseValue),
  });
}

export function useSubmitAttempt(attemptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => readingService.submitAttempt(attemptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reading", "attempt", attemptId] });
    },
  });
}

export function useAttemptResult(attemptId: string, enabled = true) {
  return useQuery({
    queryKey: ["reading", "attempt", attemptId],
    queryFn: () => readingService.getAttempt(attemptId),
    enabled: !!attemptId && enabled,
  });
}
