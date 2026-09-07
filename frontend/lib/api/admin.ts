import { apiClient } from "./client";
import {
  AdminStatisticsResponse,
  EvaluationQuestion,
  SystemInfoResponse,
} from "@/types/admin";

export const adminApi = {
  getStatistics(): Promise<AdminStatisticsResponse> {
    return apiClient.get<AdminStatisticsResponse>("/admin/statistics");
  },

  getSystemInfo(): Promise<SystemInfoResponse> {
    return apiClient.get<SystemInfoResponse>("/admin/system");
  },

  listEvaluationQuestions(
    language?: string
  ): Promise<EvaluationQuestion[]> {
    const qs = language ? `?language=${language}` : "";
    return apiClient.get<EvaluationQuestion[]>(`/evaluation/questions${qs}`);
  },

  runEvaluation(payload: {
    dataset_name?: string;
    language?: string;
    max_questions?: number;
  }): Promise<Record<string, unknown>> {
    return apiClient.post<Record<string, unknown>>("/evaluation/run", payload);
  },
};
