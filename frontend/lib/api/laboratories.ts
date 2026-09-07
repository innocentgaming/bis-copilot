import { apiClient } from "./client";
import {
  CertificationRequirementSummary,
  CertificationSchemeDetail,
  CertificationSchemeSummary,
  LaboratoryDetail,
  LaboratorySummary,
} from "@/types/laboratories";
import { PaginatedResponse } from "@/types/api";

export const laboratoriesApi = {
  listLaboratories(params?: {
    city?: string;
    state?: string;
    pincode?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<LaboratorySummary>> {
    const query = new URLSearchParams();
    if (params?.city) query.set("city", params.city);
    if (params?.state) query.set("state", params.state);
    if (params?.pincode) query.set("pincode", params.pincode);
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.offset) query.set("offset", String(params.offset));

    const qs = query.toString();
    return apiClient.get<PaginatedResponse<LaboratorySummary>>(
      `/laboratories${qs ? `?${qs}` : ""}`
    );
  },

  getLaboratory(id: string): Promise<LaboratoryDetail> {
    return apiClient.get<LaboratoryDetail>(`/laboratories/${id}`);
  },

  findByStandard(standardNumber: string): Promise<LaboratorySummary[]> {
    return apiClient.get<LaboratorySummary[]>(
      `/laboratories/find-by-standard?standard_number=${encodeURIComponent(
        standardNumber
      )}`
    );
  },

  listSchemes(
    limit = 20,
    offset = 0
  ): Promise<PaginatedResponse<CertificationSchemeSummary>> {
    return apiClient.get<PaginatedResponse<CertificationSchemeSummary>>(
      `/certification/schemes?limit=${limit}&offset=${offset}`
    );
  },

  getScheme(id: string): Promise<CertificationSchemeDetail> {
    return apiClient.get<CertificationSchemeDetail>(`/certification/schemes/${id}`);
  },

  getRequirementsForStandard(
    standardId: string
  ): Promise<CertificationRequirementSummary[]> {
    return apiClient.get<CertificationRequirementSummary[]>(
      `/certification/standards/${standardId}`
    );
  },
};
