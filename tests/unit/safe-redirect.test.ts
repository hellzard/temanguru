import { describe, expect, it } from "vitest";
import { sanitizeInternalPath } from "@/lib/auth/safe-redirect";

describe("sanitizeInternalPath", () => {
  it("mempertahankan internal query", () => {
    expect(sanitizeInternalPath("/connect?title=Halo")).toBe("/connect?title=Halo");
  });

  it.each(["https://evil.example","//evil.example","/\\evil","%2F%2Fevil.example","/auth/callback"])(
    "menolak %s", (value) => expect(sanitizeInternalPath(value)).toBe("/onboarding")
  );
});
