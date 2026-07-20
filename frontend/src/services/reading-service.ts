import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types";
import type {
  ReadingTestSummary,
  ReadingTestDetail,
  TestAttempt,
  AttemptResult,
} from "@/types/reading";

export const readingService = {
  async listTests() {
    const { data } = await apiClient.get<ApiResponse<ReadingTestSummary[]>>("/reading/tests");
    return data.data;
  },

  async getTest(testId: string) {
    const { data } = await apiClient.get<ApiResponse<ReadingTestDetail>>(`/reading/tests/${testId}`);
    return data.data;
  },

  async startAttempt(testId: string) {
    const { data } = await apiClient.post<ApiResponse<TestAttempt>>(`/reading/tests/${testId}/attempts`);
    return data.data;
  },

  async saveAnswer(attemptId: string, questionId: string, responseValue: string | null) {
    const { data } = await apiClient.patch<ApiResponse<{ questionId: string; saved: boolean }>>(
      `/reading/attempts/${attemptId}/answers`,
      { questionId, responseValue }
    );
    return data.data;
  },

  async submitAttempt(attemptId: string) {
    const { data } = await apiClient.post<ApiResponse<AttemptResult>>(`/reading/attempts/${attemptId}/submit`);
    return data.data;
  },

  async getAttempt(attemptId: string) {
    const { data } = await apiClient.get<ApiResponse<AttemptResult>>(`/reading/attempts/${attemptId}`);
    return data.data;
  },
};
