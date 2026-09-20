import { collection, doc, getDocs, limit, orderBy, query, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase-firestore";
import { normalizeClaimPayload } from "@/lib/claim-validation";

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
    const claim = normalizeClaimPayload(payload);
    if (!claim) return Response.json({ error: "A valid id, title, statement, and status are required." }, { status: 400 });
    await setDoc(doc(firestore, "claims", claim.id), claim);
    return Response.json({ claim }, { status: 201 });
  } catch {
    return Response.json({ error: "The claim could not be saved." }, { status: 500 });
  }
}
