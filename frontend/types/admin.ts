export interface VolumeCounts {
  users: number;
  documents: number;
  active_documents: number;
  standards: number;
  clauses: number;
  chunks: number;
  conversations: number;
  messages: number;
}

export interface FeedbackCounts {
  total: number;
  positive: number;
  negative: number;
  satisfaction_rate: number;
}

export interface AdminStatisticsResponse {
  volumes: VolumeCounts;
  feedback: FeedbackCounts;
  generated_at: string;
}

export interface SystemInfoResponse {
  environment: string;
  database_status: string;
  active_subsystems: {
    retrieval: string;
    generation: string;
    cache: string;
  };
}

export interface EvaluationQuestion {
  id: string;
  question: string;
  intent: string;
  language: string;
  expected_standard_number?: string | null;
  expected_clause_number?: string | null;
  expected_answer?: string | null;
}
