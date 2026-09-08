/**
 * Type definitions for BIS 'Know Your Standards' IS Number Lookup.
 */

export interface ISStandardRecord {
  id?: number;
  is_number: string;
  title: string;
  section: string;
  year_notified: number | null;
  ics_code: string | null;
  status: "Active" | "Under Revision" | "Withdrawn" | string;
  applicable_to: string | null;
  scope_description: string | null;
}

export interface ISCloseMatchRecord {
  standard: ISStandardRecord;
  match_reason: string;
  similarity_score: number;
}

export type ISLookupMatchType = "exact" | "partial" | "none";

export interface ISLookupResponseData {
  query: string;
  normalized_query: string;
  match_type: ISLookupMatchType;
  exact_match: ISStandardRecord | null;
  close_matches: ISCloseMatchRecord[];
  total_results: number;
  message: string;
}
