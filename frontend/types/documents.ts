export interface DocumentSummary {
  id: string;
  filename: string;
  document_type: string;
  page_count: number;
  file_size_bytes: number;
  checksum_sha256: string;
  status: string;
  created_at: string;
}

export interface DocumentDetail extends DocumentSummary {
  storage_path?: string | null;
  standards_count: number;
  clauses_count: number;
  chunks_count: number;
}

export interface IngestionJobResponse {
  job_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress_percent: number;
  message: string;
  document_id?: string | null;
  standard_number?: string | null;
  chunks_created: number;
}
