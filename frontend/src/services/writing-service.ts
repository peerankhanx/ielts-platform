import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types";
import type { WritingTaskSummary, WritingTaskDetail, WritingSubmission } from "@/types/writing";

export const writingService = {
  async listTasks() {
    const { data } = await apiClient.get<ApiResponse<WritingTaskSummary[]>>("/writing/tasks");
    return data.data;
  },

  async getTask(taskId: string) {
    const { data } = await apiClient.get<ApiResponse<WritingTaskDetail>>(`/writing/tasks/${taskId}`);
    return data.data;
  },

  async startSubmission(taskId: string) {
    const { data } = await apiClient.post<ApiResponse<WritingSubmission>>(`/writing/tasks/${taskId}/submissions`);
    return data.data;
  },

  async updateEssay(submissionId: string, essayText: string) {
    const { data } = await apiClient.patch<ApiResponse<{ wordCount: number; saved: boolean }>>(
      `/writing/submissions/${submissionId}`,
      { essayText }
    );
    return data.data;
  },

  async submit(submissionId: string) {
    const { data } = await apiClient.post<ApiResponse<WritingSubmission>>(
      `/writing/submissions/${submissionId}/submit`
    );
    return data.data;
  },

  async getSubmission(submissionId: string) {
    const { data } = await apiClient.get<ApiResponse<WritingSubmission>>(`/writing/submissions/${submissionId}`);
    return data.data;
  },
};
