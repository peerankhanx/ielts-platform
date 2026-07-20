import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types";
import type {
  CreateReadingTestPayload,
  CreateListeningTestPayload,
  CreateWritingTaskPayload,
  CreateSpeakingTaskPayload,
  AdminTestRow,
  AdminTaskRow,
  ListeningTestCreateResult,
  ReadingTestFull,
  ListeningTestFull,
  AdminQuestion,
  AdminPassage,
  AdminSection,
} from "@/types/content-admin";

export const contentAdminService = {
  // Reading
  async listReadingTests() {
    const { data } = await apiClient.get<ApiResponse<AdminTestRow[]>>("/admin/content/reading-tests");
    return data.data;
  },
  async createReadingTest(payload: CreateReadingTestPayload) {
    const { data } = await apiClient.post<ApiResponse<AdminTestRow>>("/admin/content/reading-tests", payload);
    return data.data;
  },

  // Listening
  async listListeningTests() {
    const { data } = await apiClient.get<ApiResponse<AdminTestRow[]>>("/admin/content/listening-tests");
    return data.data;
  },
  async createListeningTest(payload: CreateListeningTestPayload) {
    const { data } = await apiClient.post<ApiResponse<ListeningTestCreateResult>>(
      "/admin/content/listening-tests",
      payload
    );
    return data.data;
  },
  async uploadSectionAudio(sectionId: string, file: File) {
    const formData = new FormData();
    formData.append("audio", file);
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      `/admin/content/listening-sections/${sectionId}/audio`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },

  // Writing
  async listWritingTasks() {
    const { data } = await apiClient.get<ApiResponse<AdminTaskRow[]>>("/admin/content/writing-tasks");
    return data.data;
  },
  async createWritingTask(payload: CreateWritingTaskPayload) {
    const { data } = await apiClient.post<ApiResponse<AdminTaskRow>>("/admin/content/writing-tasks", payload);
    return data.data;
  },
  async toggleWritingTaskPublish(taskId: string, isPublished: boolean) {
    await apiClient.patch(`/admin/content/writing-tasks/${taskId}/publish`, { isPublished });
  },
  async deleteWritingTask(taskId: string) {
    await apiClient.delete(`/admin/content/writing-tasks/${taskId}`);
  },

  // Speaking
  async listSpeakingTasks() {
    const { data } = await apiClient.get<ApiResponse<AdminTaskRow[]>>("/admin/content/speaking-tasks");
    return data.data;
  },
  async createSpeakingTask(payload: CreateSpeakingTaskPayload) {
    const { data } = await apiClient.post<ApiResponse<AdminTaskRow>>("/admin/content/speaking-tasks", payload);
    return data.data;
  },
  async toggleSpeakingTaskPublish(taskId: string, isPublished: boolean) {
    await apiClient.patch(`/admin/content/speaking-tasks/${taskId}/publish`, { isPublished });
  },
  async deleteSpeakingTask(taskId: string) {
    await apiClient.delete(`/admin/content/speaking-tasks/${taskId}`);
  },

  // Shared (reading/listening tests)
  async toggleTestPublish(testId: string, isPublished: boolean) {
    await apiClient.patch(`/admin/content/tests/${testId}/publish`, { isPublished });
  },
  async deleteTest(testId: string) {
    await apiClient.delete(`/admin/content/tests/${testId}`);
  },

  // Full detail + nested editing (reading)
  async getReadingTestFull(testId: string) {
    const { data } = await apiClient.get<ApiResponse<ReadingTestFull>>(`/admin/content/reading-tests/${testId}/full`);
    return data.data;
  },
  async addPassage(testId: string, payload: Omit<AdminPassage, "id">) {
    const { data } = await apiClient.post<ApiResponse<AdminPassage>>(
      `/admin/content/reading-tests/${testId}/passages`,
      payload
    );
    return data.data;
  },
  async updatePassage(passageId: string, payload: Partial<Omit<AdminPassage, "id">>) {
    const { data } = await apiClient.patch<ApiResponse<AdminPassage>>(`/admin/content/passages/${passageId}`, payload);
    return data.data;
  },
  async deletePassage(passageId: string) {
    await apiClient.delete(`/admin/content/passages/${passageId}`);
  },
  async addReadingQuestion(testId: string, payload: Omit<AdminQuestion, "id">) {
    const { data } = await apiClient.post<ApiResponse<AdminQuestion>>(
      `/admin/content/reading-tests/${testId}/questions`,
      payload
    );
    return data.data;
  },

  // Full detail + nested editing (listening)
  async getListeningTestFull(testId: string) {
    const { data } = await apiClient.get<ApiResponse<ListeningTestFull>>(
      `/admin/content/listening-tests/${testId}/full`
    );
    return data.data;
  },
  async addSection(testId: string, payload: { orderIndex: number; title: string }) {
    const { data } = await apiClient.post<ApiResponse<AdminSection>>(
      `/admin/content/listening-tests/${testId}/sections`,
      payload
    );
    return data.data;
  },
  async updateSection(sectionId: string, payload: { orderIndex?: number; title?: string }) {
    const { data } = await apiClient.patch<ApiResponse<AdminSection>>(`/admin/content/sections/${sectionId}`, payload);
    return data.data;
  },
  async deleteSection(sectionId: string) {
    await apiClient.delete(`/admin/content/sections/${sectionId}`);
  },
  async addListeningQuestion(testId: string, payload: Omit<AdminQuestion, "id">) {
    const { data } = await apiClient.post<ApiResponse<AdminQuestion>>(
      `/admin/content/listening-tests/${testId}/questions`,
      payload
    );
    return data.data;
  },

  // Questions shared by reading & listening
  async updateQuestion(questionId: string, payload: Omit<AdminQuestion, "id">) {
    const { data } = await apiClient.patch<ApiResponse<AdminQuestion>>(
      `/admin/content/questions/${questionId}`,
      payload
    );
    return data.data;
  },
  async deleteQuestion(questionId: string) {
    await apiClient.delete(`/admin/content/questions/${questionId}`);
  },
};
