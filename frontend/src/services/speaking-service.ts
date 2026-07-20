import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types";
import type { SpeakingTaskSummary, SpeakingTaskDetail, SpeakingSubmission, SpeakingResponseSummary } from "@/types/speaking";

export const speakingService = {
  async listTasks() {
    const { data } = await apiClient.get<ApiResponse<SpeakingTaskSummary[]>>("/speaking/tasks");
    return data.data;
  },

  async getTask(taskId: string) {
    const { data } = await apiClient.get<ApiResponse<SpeakingTaskDetail>>(`/speaking/tasks/${taskId}`);
    return data.data;
  },

  async startSubmission(taskId: string) {
    const { data } = await apiClient.post<ApiResponse<SpeakingSubmission>>(`/speaking/tasks/${taskId}/submissions`);
    return data.data;
  },

  async uploadResponse(submissionId: string, partId: string, blob: Blob) {
    const formData = new FormData();
    formData.append("audio", blob, "response.webm");
    const { data } = await apiClient.post<ApiResponse<SpeakingResponseSummary>>(
      `/speaking/submissions/${submissionId}/parts/${partId}/audio`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },

  async submit(submissionId: string) {
    const { data } = await apiClient.post<ApiResponse<SpeakingSubmission>>(
      `/speaking/submissions/${submissionId}/submit`
    );
    return data.data;
  },

  async getSubmission(submissionId: string) {
    const { data } = await apiClient.get<ApiResponse<SpeakingSubmission>>(`/speaking/submissions/${submissionId}`);
    return data.data;
  },
};
