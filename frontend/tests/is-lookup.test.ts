import { describe, it, expect, vi } from "vitest";
import { standardsApi } from "../lib/api/standards";
import { apiClient } from "../lib/api/client";

describe("Standards API - IS Lookup", () => {
  it("encodes query correctly and calls standards lookup endpoint", async () => {
    const mockResponse = {
      query: "IS 1910-6:1993",
      normalized_query: "IS 1910-6:1993",
      match_type: "exact",
      exact_match: {
        is_number: "IS 1910-6:1993",
        title: "Code of practice",
        section: "Chemical",
        year_notified: 1993,
        ics_code: "70.072",
        status: "Under Revision",
        applicable_to: "rubber products",
        scope_description: "Applicable to rubber products manufactured, tested",
      },
      close_matches: [],
      total_results: 1,
      message: "Found exact match for standard IS 1910-6:1993.",
    };

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue(mockResponse as any);

    const result = await standardsApi.lookupISNumber("IS 1910-6:1993");

    expect(getSpy).toHaveBeenCalledWith("/standards/lookup?q=IS%201910-6%3A1993&limit=10");
    expect(result.match_type).toBe("exact");
    expect(result.exact_match?.is_number).toBe("IS 1910-6:1993");
    expect(result.exact_match?.section).toBe("Chemical");
  });
});
