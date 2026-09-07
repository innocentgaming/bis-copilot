import { apiClient } from "./client";
import {
  ClauseDetail,
  ClauseSummary,
  SearchResponseData,
  StandardDetail,
  StandardSummary,
} from "@/types/standards";
import { PaginatedResponse } from "@/types/api";

export const standardsApi = {
  listStandards(params?: {
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<StandardSummary>> {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.offset) query.set("offset", String(params.offset));

    const qs = query.toString();
    return apiClient.get<PaginatedResponse<StandardSummary>>(
      `/standards${qs ? `?${qs}` : ""}`
    );
  },

  getStandard(id: string): Promise<StandardDetail> {
    return apiClient.get<StandardDetail>(`/standards/${id}`);
  },

  getStandardClauses(id: string): Promise<ClauseSummary[]> {
    return apiClient.get<ClauseSummary[]>(`/standards/${id}/clauses`);
  },

  getClause(id: string): Promise<ClauseDetail> {
    return apiClient.get<ClauseDetail>(`/clauses/${id}`);
  },

  search(params: {
    query: string;
    standard_number?: string;
    clause_number?: string;
    limit?: number;
  }): Promise<SearchResponseData> {
    return apiClient.post<SearchResponseData>("/search", params);
  },
};
