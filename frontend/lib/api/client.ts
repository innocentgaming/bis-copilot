import { ResponseEnvelope, ErrorDetail } from "@/types/api";
import { mapErrorCodeToMessage } from "@/lib/utils/error-mapper";

export class ApiException extends Error {
  code: string;
  details?: Record<string, unknown> | null;
  status: number;

  constructor(code: string, message: string, status = 400, details?: Record<string, unknown> | null) {
    super(message);
    this.name = "ApiException";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bis_copilot_token");
}

function createRequestId(): string {
  return "fe-" + Math.random().toString(36).substring(2, 10);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();

  const headers = new Headers(options.headers || {});
  headers.set("X-Request-ID", createRequestId());

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new ApiException(
      "CONNECTION_ERROR",
      `Unable to connect to compliance service at ${API_BASE_URL}: ${errorMsg}`,
      0
    );
  }

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bis_copilot_token");
      localStorage.removeItem("bis_copilot_user");
    }
  }

  let json: ResponseEnvelope<T>;
  try {
    json = await response.json();
  } catch {
    throw new ApiException(
      "SERVER_ERROR",
      `Invalid JSON received from server (${response.status})`,
      response.status
    );
  }

  if (!response.ok || !json.success) {
    const error: ErrorDetail = json.error || {
      code: `HTTP_${response.status}`,
      message: response.statusText || "Request failed",
    };
    const friendly = mapErrorCodeToMessage(error.code, error.message);
    throw new ApiException(error.code, friendly, response.status, error.details);
  }

  return json.data as T;
}

export const apiClient = {
  get<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return request<T>(endpoint, { method: "GET", headers });
  },

  post<T>(endpoint: string, body?: unknown, headers?: HeadersInit): Promise<T> {
    return request<T>(endpoint, {
      method: "POST",
      headers,
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  patch<T>(endpoint: string, body?: unknown, headers?: HeadersInit): Promise<T> {
    return request<T>(endpoint, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return request<T>(endpoint, { method: "DELETE", headers });
  },

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return request<T>(endpoint, {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Subscribe to Server-Sent Events from /chat/stream
   */
  async streamChat(
    endpoint: string,
    body: unknown,
    onToken: (token: string) => void,
    onFinal: (finalData: any) => void,
    onError: (err: Error) => void
  ): Promise<void> {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const token = getAuthToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Request-ID": createRequestId(),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    } catch (err: unknown) {
      onError(new Error(err instanceof Error ? err.message : "Network error"));
      return;
    }

    if (!response.ok) {
      onError(new Error(`Server error: ${response.status} ${response.statusText}`));
      return;
    }

    if (!response.body) {
      onError(new Error("Response has no readable body"));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.trim()) continue;

          let eventName = "message";
          let dataStr = "";

          const lines = part.split("\n");
          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.replace("event:", "").trim();
            } else if (line.startsWith("data:")) {
              dataStr += line.replace("data:", "").trim();
            }
          }

          if (eventName === "token") {
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed && typeof parsed.chunk === "string") {
                onToken(parsed.chunk);
              }
            } catch {
              onToken(dataStr);
            }
          } else if (eventName === "final") {
            try {
              const parsed = JSON.parse(dataStr);
              onFinal(parsed);
            } catch (err) {
              console.error("Failed to parse final event payload", err);
            }
          }
        }
      }
    } catch (err: unknown) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  },
};
