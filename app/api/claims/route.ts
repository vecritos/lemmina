import { collection, doc, getDocs, limit, orderBy, query, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase-firestore";

const allowedStatuses = new Set(["incomplete", "supported", "verified", "challenged"]);

export async function GET() {
  try {
    const snapshot = await getDocs(query(collection(firestore, "claims"), orderBy("updatedAt", "desc"), limit(100)));
    return Response.json({ claims: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) });
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
    const claim = {
      id,
      title: title.slice(0, 160),
      statement: statement.slice(0, 4000),
      status,
      kind: String(payload.kind ?? "Claim").slice(0, 40),
      risk: String(payload.risk ?? "Not yet reviewed.").slice(0, 1000),
      evidence: Number(payload.evidence ?? 0),
      dependencies: Array.isArray(payload.dependencies) ? payload.dependencies.map(String) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(firestore, "claims", id), claim);
    return Response.json({ claim }, { status: 201 });
  } catch {
    return Response.json({ error: "The claim could not be saved." }, { status: 500 });
  }
}
