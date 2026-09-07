export interface ResponseMeta {
  request_id: string;
  timestamp: string;
  processing_ms?: number | null;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown> | null;
}

export interface ResponseEnvelope<T> {
  success: boolean;
  data: T | null;
  error: ErrorDetail | null;
  meta: ResponseMeta;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: int_or_number;
  limit: number;
  offset: number;
  has_more: boolean;
}

type int_or_number = number;
