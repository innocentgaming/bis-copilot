import { describe, it, expect } from "vitest";
import { ApiException } from "../lib/api/client";

describe("API Client & Exceptions", () => {
  it("initializes ApiException with code, status and friendly message", () => {
    const exc = new ApiException("VALIDATION_ERROR", "Invalid standard parameter", 422);
    expect(exc.code).toBe("VALIDATION_ERROR");
    expect(exc.status).toBe(422);
    expect(exc.message).toBe("Invalid standard parameter");
    expect(exc.name).toBe("ApiException");
  });
});
