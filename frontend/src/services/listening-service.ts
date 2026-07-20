import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types";
import type { ListeningTestSummary, ListeningTestDetail } from "@/types/listening";
import type { TestAttempt, AttemptResult } from "@/types/reading";

export const listeningService = {
  async listTests() {
    const { data } = await apiClient.get<ApiResponse<ListeningTestSummary[]>>("/listening/tests");
    return data.data;
  },

  async getTest(testId: string) {
    const { data } = await apiClient.get<ApiResponse<ListeningTestDetail>>(`/listening/tests/${testId}`);
    return data.data;
  },

  async startAttempt(testId: string) {
    const { data } = await apiClient.post<ApiResponse<TestAttempt>>(`/listening/tests/${testId}/attempts`);
    return data.data;
  },

  async saveAnswer(attemptId: string, questionId: string, responseValue: string | null) {
    const { data } = await apiClient.patch<ApiResponse<{ questionId: string; saved: boolean }>>(
      `/listening/attempts/${attemptId}/answers`,
      { questionId, responseValue }
    );
    return data.data;
  },

  async submitAttempt(attemptId: string) {
    const { data } = await apiClient.post<ApiResponse<AttemptResult>>(`/listening/attempts/${attemptId}/submit`);
    return data.data;
  },

  async getAttempt(attemptId: string) {
    const { data } = await apiClient.get<ApiResponse<AttemptResult>>(`/listening/attempts/${attemptId}`);
    return data.data;
  },
};
