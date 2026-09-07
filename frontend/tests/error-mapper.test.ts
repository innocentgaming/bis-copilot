import { describe, it, expect } from "vitest";
import { mapErrorCodeToMessage } from "../lib/utils/error-mapper";

describe("Frontend Error Mapper", () => {
  it("maps INSUFFICIENT_EVIDENCE to friendly guidance", () => {
    const msg = mapErrorCodeToMessage("INSUFFICIENT_EVIDENCE");
    expect(msg).toContain("authoritative evidence");
  });

  it("maps DUPLICATE_DOCUMENT properly", () => {
    const msg = mapErrorCodeToMessage("DUPLICATE_DOCUMENT");
    expect(msg).toContain("already exists");
  });

  it("maps PROVIDER_UNAVAILABLE properly", () => {
    const msg = mapErrorCodeToMessage("PROVIDER_UNAVAILABLE");
    expect(msg).toContain("temporarily unavailable");
  });

  it("falls back gracefully on unknown errors", () => {
    const msg = mapErrorCodeToMessage("UNKNOWN_CODE", "Custom fallback message");
    expect(msg).toBe("Custom fallback message");
  });
});
