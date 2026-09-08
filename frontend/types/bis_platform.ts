export type IndianLanguageCode =
  | "en"
  | "hi"
  | "ta"
  | "te"
  | "bn"
  | "mr"
  | "gu"
  | "kn"
  | "ml"
  | "pa"
  | "or";

export interface LanguageOption {
  code: IndianLanguageCode;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം" },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ" },
  { code: "or", label: "Odia", nativeLabel: "ଓଡ଼ିଆ" },
];

export interface BISService {
  name: string;
  slug: string;
  category: string;
  description: string;
  eligibility: string;
  documents_required: string[];
  fee_structure: string;
  processing_time_days: number;
  how_to_apply: string;
  portal_url?: string;
  is_active: boolean;
}

export interface ApplicationTimelineStep {
  step_name: string;
  step_status: "COMPLETED" | "IN_PROGRESS" | "PENDING" | "REJECTED";
  description: string;
  performed_by: string;
  timestamp: string;
}

export interface BISApplication {
  id: string;
  application_number: string;
  service_name: string;
  standard_number?: string;
  applicant_name: string;
  company_name: string;
  contact_email: string;
  contact_phone?: string;
  current_status: string;
  current_step_index: number;
  assigned_department: string;
  expected_completion_date?: string;
  created_at: string;
  remarks?: string;
  timeline: ApplicationTimelineStep[];
}

export interface ComplaintCreatePayload {
  category: string;
  product_name: string;
  brand_name?: string;
  batch_number?: string;
  seller_name?: string;
  seller_address?: string;
  is_number?: string;
  huid_number?: string;
  license_number?: string;
  description: string;
  evidence_urls?: string[];
  complainant_name: string;
  complainant_email: string;
  complainant_phone?: string;
}

export interface ComplaintRecord {
  id: string;
  tracking_id: string;
  category: string;
  product_name: string;
  brand_name?: string;
  batch_number?: string;
  seller_name?: string;
  seller_address?: string;
  is_number?: string;
  huid_number?: string;
  license_number?: string;
  description: string;
  evidence_urls: string[];
  complainant_name: string;
  complainant_email: string;
  complainant_phone?: string;
  status: string;
  status_label: string;
  next_action: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HUIDVerificationResult {
  is_valid: boolean;
  huid: string;
  article_type?: string;
  metal_type?: string;
  purity_fineness?: string;
  purity_karat?: string;
  ahc_center_name?: string;
  ahc_center_number?: string;
  jeweler_name?: string;
  jeweler_registration_number?: string;
  hallmarking_date?: string;
  applicable_standard: string;
  status: string;
  verification_notes: string;
  consumer_guidance: string[];
}

export interface AHCCenter {
  center_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  recognition_status: string;
  contact_email: string;
  phone: string;
}

export interface ComplianceChecklistItem {
  title: string;
  completed: boolean;
  category: string;
}

export interface ComplianceRecord {
  id: string;
  product_name: string;
  standard_number: string;
  scheme_name: string;
  compliance_score: number;
  status: "COMPLIANT" | "PARTIALLY_COMPLIANT" | "ACTION_REQUIRED";
  expiry_date?: string;
  checklist_items: ComplianceChecklistItem[];
  missing_requirements: string[];
}

export interface BISFAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  related_standard?: string;
  source_url?: string;
}

export interface BISNotification {
  id: string;
  title: string;
  message: string;
  type: "APPLICATION" | "STANDARD" | "COMPLIANCE" | "CERTIFICATE" | "ANNOUNCEMENT" | string;
  link_url?: string;
  is_read: boolean;
  priority: "HIGH" | "NORMAL" | "LOW";
  created_at: string;
}

export interface VoiceQueryResponse {
  transcription: string;
  detected_language: string;
  detected_standard?: string;
  response: string;
  confidence: string;
}

export interface VisionQueryResponse {
  image_name: string;
  detected_type: string;
  possible_standard: string;
  compliance_status: string;
  detected_features: string[];
  recommended_next_steps: string[];
  disclaimer: string;
}

export interface DocumentAIResponse {
  document_name: string;
  document_summary: string;
  key_requirements: string[];
  required_documents: string[];
  important_dates_and_fees: Record<string, string>;
  applicable_standards: string[];
  action_items: string[];
  potential_issues: string[];
}

export interface ProductVerificationRequest {
  cml_license_number?: string;
  is_number?: string;
  manufacturer_name?: string;
  product_name?: string;
  image_filename?: string;
}

export interface ProductVerificationResult {
  status: "VERIFIED" | "NEEDS_VERIFICATION" | "NOT_FOUND" | string;
  status_label: string;
  product_name: string;
  manufacturer_name: string;
  cml_license_number: string;
  is_number: string;
  standard_title: string;
  certification_scheme: string;
  validity_period: string;
  factory_location: string;
  safety_summary: string;
  applicable_clauses: string[];
  warning_notice?: string | null;
  verification_source: string;
  is_genuine_mark: boolean;
  disclaimer: string;
}

