import { describe, expect, it } from "vitest";
import { normalizeClaimPayload } from "./claim-validation";

describe("normalizeClaimPayload", () => {
  it("normalizes a valid claim and applies defaults", () => {
    expect(normalizeClaimPayload({ id: " L1 ", title: "Decay", statement: "The kernel decays." }, "2026-09-20T00:00:00.000Z")).toEqual({
      id: "L1",
      title: "Decay",
      statement: "The kernel decays.",
      status: "incomplete",
      kind: "Claim",
      risk: "Not yet reviewed.",
      evidence: 0,
      dependencies: [],
      createdAt: "2026-09-20T00:00:00.000Z",
      updatedAt: "2026-09-20T00:00:00.000Z",
    });
  });

  it("rejects missing fields and unsupported statuses", () => {
    expect(normalizeClaimPayload({ id: "L1", title: "", statement: "Text" })).toBeNull();
    expect(normalizeClaimPayload({ id: "L1", title: "Title", statement: "Text", status: "draft" })).toBeNull();
  });

  it("bounds long text and keeps evidence numeric", () => {
    const claim = normalizeClaimPayload({ id: "L1", title: "x".repeat(200), statement: "y".repeat(5000), evidence: "not a number" });
    expect(claim?.title).toHaveLength(160);
    expect(claim?.statement).toHaveLength(4000);
    expect(claim?.evidence).toBe(0);
  });
});