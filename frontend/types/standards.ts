export interface ClauseSummary {
  id: string;
  clause_number: string;
  heading?: string | null;
  page_start?: number | null;
  page_end?: number | null;
  parent_clause_id?: string | null;
}

export interface ClauseDetail extends ClauseSummary {
  standard_id: string;
  content: string;
  children: ClauseSummary[];
}

export interface StandardSummary {
  id: string;
  standard_number: string;
  title: string;
  short_title?: string | null;
  edition?: string | null;
  status: string;
  publication_date?: string | null;
}

export interface StandardDetail extends StandardSummary {
  scope?: string | null;
  document_id?: string | null;
  clauses_count: number;
  clauses: ClauseSummary[];
}

export interface SearchHit {
  chunk_id: string;
  content: string;
  standard_number?: string | null;
  clause_number?: string | null;
  heading?: string | null;
  pages?: string | null;
  score: number;
  citation_text?: string | null;
}

export interface SearchResponseData {
  query: string;
  normalized_query: string;
  total_results: number;
  duration_ms: number;
  hits: SearchHit[];
}
