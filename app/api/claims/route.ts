import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { claimDependencies, claims } from "@/db/schema";

const allowedStatuses = new Set(["incomplete", "supported", "verified", "challenged"]);

export async function GET() {
  try {
    const db = getDb();
    const [rows, links] = await Promise.all([
      db.select().from(claims).orderBy(desc(claims.updatedAt)).limit(100),
      db.select().from(claimDependencies),
    ]);
    return Response.json({ claims: rows.map((claim) => ({ ...claim, dependencies: links.filter((link) => link.claimId === claim.id).map((link) => link.dependencyId) })) });
  } catch {
    return Response.json({ error: "Research storage is temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const id = String(payload.id ?? "").trim();
    const title = String(payload.title ?? "").trim();
    const statement = String(payload.statement ?? "").trim();
    const status = String(payload.status ?? "incomplete");
    if (!id || !title || !statement || !allowedStatuses.has(status)) return Response.json({ error: "A valid id, title, statement, and status are required." }, { status: 400 });
    const db = getDb();
    await db.insert(claims).values({ id, title: title.slice(0, 160), statement: statement.slice(0, 4000), status, kind: String(payload.kind ?? "Claim").slice(0, 40), risk: String(payload.risk ?? "Not yet reviewed.").slice(0, 1000), evidence: Number(payload.evidence ?? 0) });
    const [claim] = await db.select().from(claims).where(eq(claims.id, id));
    return Response.json({ claim }, { status: 201 });
  } catch {
    return Response.json({ error: "The claim could not be saved." }, { status: 500 });
  }
}
