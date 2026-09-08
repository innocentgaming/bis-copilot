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
