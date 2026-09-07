import { describe, it, expect } from "vitest";
import {
  formatBytes,
  formatCitationBadge,
  formatConfidence,
} from "../lib/utils/formatters";

describe("Frontend Formatters", () => {
  it("formats confidence percentages properly", () => {
    expect(formatConfidence(0.942)).toBe("94%");
    expect(formatConfidence(1.0)).toBe("100%");
    expect(formatConfidence(0.0)).toBe("0%");
  });

  it("formats byte sizes cleanly", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1048576)).toBe("1 MB");
  });

  it("formats citation badge string correctly", () => {
    const text = formatCitationBadge({
      standard: "IS 99999:2025",
      clause: "5.2",
      pages: "5–6",
    });
    expect(text).toBe("[IS 99999:2025, Clause 5.2, pp. 5–6]");
  });
});
