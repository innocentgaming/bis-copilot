export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";

export interface AnswerCitation {
  standard: string;
  clause?: string | null;
  pages?: string | null;
  chunk_id?: string | null;
  document_id?: string | null;
  relevance_score?: number | null;
  citation_text: string;
}

export interface ProcessingTimings {
  retrieval_ms: number;
  context_ms: number;
  generation_ms: number;
  validation_ms: number;
  persistence_ms: number;
  total_ms: number;
}

export interface ChatFilters {
  standard_number?: string | null;
  standard_id?: string | null;
  document_id?: string | null;
  clause_number?: string | null;
}

export interface ChatRequest {
  query: string;
  conversation_id?: string | null;
  language?: "en" | "hi" | "mr";
  filters?: ChatFilters | null;
}

export interface ChatResponseData {
  conversation_id: string;
  message_id: string;
  answer: string;
  confidence: number;
  confidence_level: ConfidenceLevel;
  intent: string;
  insufficient_evidence: boolean;
  citations: AnswerCitation[];
  caveats: string[];
  follow_up_questions: string[];
  processing: ProcessingTimings;
}

export interface MessageDetail {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  confidence_score?: number | null;
  confidence_level?: string | null;
  insufficient_evidence?: boolean;
  created_at: string;
  citations: AnswerCitation[];
}

export interface ConversationDetail {
  id: string;
  user_id?: string | null;
  title: string;
  language: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}
