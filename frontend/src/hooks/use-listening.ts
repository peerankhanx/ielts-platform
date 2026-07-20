import { useMutation, useQuery } from "@tanstack/react-query";
import { listeningService } from "@/services/listening-service";

export function useListeningTests() {
  return useQuery({
    queryKey: ["listening", "tests"],
    queryFn: listeningService.listTests,
  });
}

export function useListeningTest(testId: string) {
  return useQuery({
    queryKey: ["listening", "test", testId],
    queryFn: () => listeningService.getTest(testId),
    enabled: !!testId,
  });
}

export function useStartListeningAttempt(testId: string) {
  return useMutation({
    mutationFn: () => listeningService.startAttempt(testId),
  });
}
