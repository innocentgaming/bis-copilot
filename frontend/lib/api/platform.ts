import { apiClient } from "./client";
import {
  BISService,
  BISApplication,
  ComplianceRecord,
  BISFAQ,
  BISNotification,
  VoiceQueryResponse,
  VisionQueryResponse,
  DocumentAIResponse,
  ComplaintRecord,
  ComplaintCreatePayload,
  HUIDVerificationResult,
  AHCCenter,
} from "@/types/bis_platform";

export const platformApi = {
  // Services
  listServices(params?: { category?: string; search?: string }): Promise<BISService[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "all") query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return apiClient.get<BISService[]>(`/bis-services${qs ? `?${qs}` : ""}`);
  },

  getService(slug: string): Promise<BISService> {
    return apiClient.get<BISService>(`/bis-services/${slug}`);
  },

  // Applications
  listApplications(status?: string): Promise<BISApplication[]> {
    const query = new URLSearchParams();
    if (status && status !== "all") query.set("status", status);
    const qs = query.toString();
    return apiClient.get<BISApplication[]>(`/applications${qs ? `?${qs}` : ""}`);
  },

  trackApplication(applicationNumber: string): Promise<BISApplication> {
    return apiClient.get<BISApplication>(`/applications/track/${encodeURIComponent(applicationNumber.trim())}`);
  },

  getApplication(id: string): Promise<BISApplication> {
    return apiClient.get<BISApplication>(`/applications/${id}`);
  },

  submitApplication(data: {
    service_name: string;
    standard_number?: string;
    applicant_name: string;
    company_name: string;
    contact_email: string;
    contact_phone?: string;
  }): Promise<BISApplication> {
    return apiClient.post<BISApplication>("/applications", data);
  },

  // Complaints
  fileComplaint(data: ComplaintCreatePayload): Promise<ComplaintRecord> {
    return apiClient.post<ComplaintRecord>("/complaints", data);
  },

  getComplaint(trackingId: string): Promise<ComplaintRecord> {
    return apiClient.get<ComplaintRecord>(`/complaints/${encodeURIComponent(trackingId.trim())}`);
  },

  listComplaints(params?: { email?: string; category?: string; status?: string }): Promise<ComplaintRecord[]> {
    const query = new URLSearchParams();
    if (params?.email) query.set("email", params.email);
    if (params?.category) query.set("category", params.category);
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return apiClient.get<ComplaintRecord[]>(`/complaints${qs ? `?${qs}` : ""}`);
  },

  // Hallmarking & HUID
  verifyHUID(huid: string): Promise<HUIDVerificationResult> {
    return apiClient.get<HUIDVerificationResult>(`/hallmarking/verify/${encodeURIComponent(huid.trim())}`);
  },

  listAHCCenters(params?: { state?: string; city?: string }): Promise<AHCCenter[]> {
    const query = new URLSearchParams();
    if (params?.state) query.set("state", params.state);
    if (params?.city) query.set("city", params.city);
    const qs = query.toString();
    return apiClient.get<AHCCenter[]>(`/hallmarking/centers${qs ? `?${qs}` : ""}`);
  },

  // Compliance
  listComplianceRecords(): Promise<ComplianceRecord[]> {
    return apiClient.get<ComplianceRecord[]>("/compliance/records");
  },

  evaluateCompliance(data: {
    product_name: string;
    standard_number: string;
    industry?: string;
  }): Promise<any> {
    return apiClient.post<any>("/compliance/evaluate", data);
  },

  // FAQs
  listFAQs(params?: { category?: string; search?: string }): Promise<BISFAQ[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "all") query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return apiClient.get<BISFAQ[]>(`/faqs${qs ? `?${qs}` : ""}`);
  },

  // Notifications
  listNotifications(params?: { unread_only?: boolean; type?: string }): Promise<BISNotification[]> {
    const query = new URLSearchParams();
    if (params?.unread_only) query.set("unread_only", "true");
    if (params?.type && params.type !== "all") query.set("type", params.type);
    const qs = query.toString();
    return apiClient.get<BISNotification[]>(`/notifications${qs ? `?${qs}` : ""}`);
  },

  getUnreadNotificationsCount(): Promise<{ unread_count: number }> {
    return apiClient.get<{ unread_count: number }>("/notifications/unread-count");
  },

  markNotificationRead(id: string): Promise<{ id: string; is_read: boolean }> {
    return apiClient.patch<{ id: string; is_read: boolean }>(`/notifications/${id}/read`);
  },

  markAllNotificationsRead(): Promise<{ marked_count: number }> {
    return apiClient.post<{ marked_count: number }>("/notifications/mark-all-read");
  },

  // Multimodal AI
  processVoice(data: { transcript: string; language: string }): Promise<VoiceQueryResponse> {
    return apiClient.post<VoiceQueryResponse>("/multimodal/voice", data);
  },

  analyzeVision(data: { image_name: string; image_type: string }): Promise<VisionQueryResponse> {
    return apiClient.post<VisionQueryResponse>("/multimodal/vision", data);
  },

  analyzeDocument(formData: FormData): Promise<DocumentAIResponse> {
    return apiClient.post<DocumentAIResponse>("/multimodal/document-ai", formData);
  },
};
