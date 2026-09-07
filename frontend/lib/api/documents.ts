import { apiClient } from "./client";
import {
  DocumentDetail,
  DocumentSummary,
  IngestionJobResponse,
} from "@/types/documents";
import { PaginatedResponse } from "@/types/api";

export const documentsApi = {
  uploadAndIngest(
    file: File,
    force = false
  ): Promise<IngestionJobResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("force", String(force));

    return apiClient.upload<IngestionJobResponse>("/documents/ingest", formData);
  },

  getJobStatus(jobId: string): Promise<IngestionJobResponse> {
    return apiClient.get<IngestionJobResponse>(`/documents/jobs/${jobId}`);
  },

  listDocuments(params?: {
    document_type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<DocumentSummary>> {
    const query = new URLSearchParams();
    if (params?.document_type) query.set("document_type", params.document_type);
    if (params?.status) query.set("status", params.status);
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.offset) query.set("offset", String(params.offset));

    const qs = query.toString();
    return apiClient.get<PaginatedResponse<DocumentSummary>>(
      `/documents${qs ? `?${qs}` : ""}`
    );
  },

  getDocument(id: string): Promise<DocumentDetail> {
    return apiClient.get<DocumentDetail>(`/documents/${id}`);
  },
};
