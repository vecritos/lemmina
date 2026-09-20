export const allowedClaimStatuses = new Set(["incomplete", "supported", "verified", "challenged"]);

export type ClaimPayload = {
  id: string;
  title: string;
  statement: string;
  status: string;
  kind: string;
  risk: string;
  evidence: number;
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
};

export function normalizeClaimPayload(payload: Record<string, unknown>, now = new Date().toISOString()): ClaimPayload | null {
  const id = String(payload.id ?? "").trim();
  const title = String(payload.title ?? "").trim();
  const statement = String(payload.statement ?? "").trim();
  const status = String(payload.status ?? "incomplete");
  if (!id || !title || !statement || !allowedClaimStatuses.has(status)) return null;

  const evidence = Number(payload.evidence ?? 0);
  return {
    id,
    title: title.slice(0, 160),
    statement: statement.slice(0, 4000),
    status,
    kind: String(payload.kind ?? "Claim").slice(0, 40),
    risk: String(payload.risk ?? "Not yet reviewed.").slice(0, 1000),
    evidence: Number.isFinite(evidence) ? evidence : 0,
    dependencies: Array.isArray(payload.dependencies) ? payload.dependencies.map(String) : [],
    createdAt: now,
    updatedAt: now,
  };
}