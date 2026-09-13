"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BookOpen, Check, ChevronRight, CircleDashed, GitBranch, Link2, Menu, Plus, Search, ShieldAlert, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ClaimStatus = "incomplete" | "supported" | "verified" | "challenged";
type Claim = { id: string; title: string; statement: string; status: ClaimStatus; kind: string; risk: string; dependencies: string[]; evidence: number; updatedAt: string };

const seedClaims: Claim[] = [
  { id: "L2", title: "Fourier transform existence", statement: "The transformed theta kernel belongs to a function space in which its Fourier transform is well-defined.", status: "incomplete", kind: "Lemma", risk: "Direct convergence has not been separated from analytic continuation.", dependencies: ["D1", "L1"], evidence: 2, updatedAt: "12 min ago" },
  { id: "L1", title: "Theta-kernel decay", statement: "After the logarithmic substitution, the normalized theta kernel decays sufficiently at both ends.", status: "supported", kind: "Lemma", risk: "The bound near negative infinity still depends on the modular identity.", dependencies: ["D1"], evidence: 4, updatedAt: "Yesterday" },
  { id: "D1", title: "Jacobi transformation identity", statement: "The theta function satisfies θ(t) = t⁻¹ᐟ² θ(1/t) for positive real t.", status: "verified", kind: "Definition", risk: "", dependencies: [], evidence: 3, updatedAt: "Sep 10" },
  { id: "C1", title: "Cancellation isolates critical-line zeros", statement: "The symmetric Mellin representation can be rearranged so the remaining oscillatory cancellation characterizes the desired zeros.", status: "challenged", kind: "Conjecture", risk: "The current rearrangement may be circular because it imports the functional equation.", dependencies: ["L2", "L1"], evidence: 1, updatedAt: "Sep 8" },
];

const statusStyle: Record<ClaimStatus, string> = {
  incomplete: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  supported: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  verified: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  challenged: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

export default function Home() {
  const [claims, setClaims] = useState(seedClaims);
  const [selectedId, setSelectedId] = useState("L2");
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/claims").then((r) => r.ok ? r.json() : Promise.reject()).then((data: { claims?: Claim[] }) => {
      if (data.claims?.length) { setClaims(data.claims); setSelectedId(data.claims[0].id); }
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "create_research_claim",
      title: "Create research claim",
      description: "Add a precisely stated claim to the visible research workspace for later evidence and dependency review.",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 1, maxLength: 160 },
          statement: { type: "string", minLength: 1, maxLength: 4000 },
          kind: { type: "string", enum: ["Claim", "Lemma", "Definition", "Conjecture"] },
        },
        required: ["title", "statement"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async (input: unknown) => {
        const value = input as { title?: string; statement?: string; kind?: string };
        if (!value.title?.trim() || !value.statement?.trim()) throw new Error("title and statement are required");
        const claim: Claim = { id: `C${Date.now().toString().slice(-6)}`, title: value.title.trim().slice(0, 160), statement: value.statement.trim().slice(0, 4000), status: "incomplete", kind: value.kind ?? "Claim", risk: "Not yet reviewed.", dependencies: [], evidence: 0, updatedAt: "Just now" };
        setClaims((current) => [claim, ...current]);
        setSelectedId(claim.id);
        const response = await fetch("/api/claims", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(claim) });
        if (!response.ok) throw new Error("The claim could not be saved.");
        return { id: claim.id, status: claim.status, title: claim.title };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  const filtered = claims.filter((claim) => `${claim.id} ${claim.title} ${claim.statement}`.toLowerCase().includes(query.toLowerCase()));
  const selected = claims.find((claim) => claim.id === selectedId) ?? claims[0];
  const dependents = useMemo(() => claims.filter((claim) => claim.dependencies.includes(selected?.id ?? "")), [claims, selected]);

  function addClaim(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    const statement = String(formData.get("statement") ?? "").trim();
    if (!title || !statement) return;
    const claim: Claim = { id: `C${Date.now().toString().slice(-6)}`, title, statement, status: "incomplete", kind: String(formData.get("kind") ?? "Claim"), risk: "Not yet reviewed.", dependencies: [], evidence: 0, updatedAt: "Just now" };
    setClaims((current) => [claim, ...current]);
    setSelectedId(claim.id); setShowNew(false); setNotice("Claim added to the workspace.");
    fetch("/api/claims", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(claim) }).catch(() => undefined);
  }

  function challengeClaim() {
    if (!selected) return;
    setClaims((current) => current.map((claim) => claim.id === selected.id ? { ...claim, status: "challenged", risk: claim.risk || "The claim needs an independent justification." } : claim));
    setNotice("Skeptical review recorded a challenge.");
  }

  return <main className="min-h-screen bg-[#080b10] text-[#e8edf4]">
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-white/10 bg-[#080b10]/95 px-4 backdrop-blur sm:px-6">
      <button className="mr-3 md:hidden" aria-label="Open navigation" onClick={() => setMenuOpen(!menuOpen)}><Menu className="size-5" /></button>
      <div className="flex items-center gap-3 font-semibold tracking-tight"><span className="grid size-8 place-items-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300"><GitBranch className="size-4" /></span>Lemmina</div>
      <div className="ml-auto hidden items-center gap-2 text-sm text-slate-400 sm:flex"><span className="size-2 rounded-full bg-emerald-400" /> Research saved</div>
    </header>

    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1600px] grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_320px]">
      <aside className={`${menuOpen ? "block" : "hidden"} border-r border-white/10 bg-[#0b0f16] p-4 md:block`}>
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
        <nav className="space-y-1 text-sm">
          <button className="flex w-full items-center gap-3 rounded-lg bg-white/8 px-3 py-2.5 text-left text-white"><BookOpen className="size-4 text-cyan-300" /> Critical Line Study</button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-slate-400 hover:bg-white/5"><GitBranch className="size-4" /> Claim graph</button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-slate-400 hover:bg-white/5"><ShieldAlert className="size-4" /> Review queue<span className="ml-auto rounded-full bg-rose-400/15 px-2 text-xs text-rose-300">2</span></button>
        </nav>
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.025] p-3"><p className="text-xs text-slate-500">Research health</p><div className="mt-2 flex items-end gap-2"><span className="text-2xl font-semibold">61%</span><span className="mb-1 text-xs text-amber-300">2 open risks</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[61%] rounded-full bg-cyan-400" /></div></div>
      </aside>

      <section className="min-w-0 border-r border-white/10">
        <div className="border-b border-white/10 px-4 py-5 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Critical Line Study / Claims</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Argument map</h1></div><Button onClick={() => setShowNew(true)} className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"><Plus /> New claim</Button></div>
          <div className="relative mt-5 max-w-xl"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search claims, lemmas, and definitions" className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.035] pl-10 pr-4 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-400/50" /></div>
        </div>

        {showNew && <form action={addClaim} className="m-4 rounded-xl border border-cyan-400/25 bg-cyan-400/[0.045] p-4 sm:m-7">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Add a research claim</h2><button type="button" aria-label="Close" onClick={() => setShowNew(false)}><X className="size-4" /></button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_150px]"><input name="title" required placeholder="Short title" className="rounded-lg border border-white/10 bg-[#080b10] px-3 py-2 text-sm outline-none focus:border-cyan-400/50" /><select name="kind" className="rounded-lg border border-white/10 bg-[#080b10] px-3 py-2 text-sm"><option>Claim</option><option>Lemma</option><option>Definition</option><option>Conjecture</option></select></div>
          <textarea name="statement" required placeholder="State the claim precisely…" className="mt-3 min-h-24 w-full rounded-lg border border-white/10 bg-[#080b10] px-3 py-2 text-sm outline-none focus:border-cyan-400/50" />
          <Button type="submit" size="sm" className="mt-3 bg-cyan-300 text-slate-950 hover:bg-cyan-200">Create claim</Button>
        </form>}

        <div className="divide-y divide-white/8">{filtered.map((claim) => <button key={claim.id} onClick={() => setSelectedId(claim.id)} className={`group grid w-full gap-4 px-4 py-5 text-left transition hover:bg-white/[0.035] sm:grid-cols-[48px_minmax(0,1fr)_auto] sm:px-7 ${selected?.id === claim.id ? "bg-cyan-400/[0.045]" : ""}`}>
          <span className="font-mono text-sm text-cyan-300">{claim.id}</span><span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><strong className="font-medium">{claim.title}</strong><Badge variant="outline" className={statusStyle[claim.status]}>{claim.status}</Badge></span><span className="mt-2 line-clamp-2 block text-sm leading-6 text-slate-400">{claim.statement}</span><span className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500"><span>{claim.kind}</span><span>{claim.dependencies.length} dependencies</span><span>{claim.evidence} evidence items</span></span></span><ChevronRight className="hidden size-4 self-center text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-300 sm:block" />
        </button>)}</div>
      </section>

      <aside className="hidden bg-[#0b0f16] xl:block">{selected && <Tabs defaultValue="inspect" className="h-full">
        <div className="border-b border-white/10 px-5 pt-4"><TabsList variant="line" className="w-full justify-start"><TabsTrigger value="inspect">Inspect</TabsTrigger><TabsTrigger value="review">Skeptical review</TabsTrigger></TabsList></div>
        <TabsContent value="inspect" className="p-5"><div className="flex items-center justify-between text-xs text-slate-500"><span>{selected.kind}</span><span>{selected.updatedAt}</span></div><h2 className="mt-3 text-xl font-semibold leading-snug">{selected.title}</h2><p className="mt-4 text-sm leading-6 text-slate-300">{selected.statement}</p><div className="mt-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Depends on</p><div className="mt-3 space-y-2">{selected.dependencies.length ? selected.dependencies.map((id) => <button key={id} onClick={() => setSelectedId(id)} className="flex w-full items-center gap-2 rounded-lg border border-white/10 p-3 text-left text-sm hover:border-cyan-400/30"><Link2 className="size-4 text-cyan-300" /><span className="font-mono text-xs">{id}</span><span className="truncate text-slate-400">{claims.find((item) => item.id === id)?.title}</span></button>) : <p className="text-sm text-slate-500">No dependencies recorded.</p>}</div></div>{dependents.length > 0 && <p className="mt-5 text-xs text-slate-500">Supports {dependents.map((item) => item.id).join(", ")}</p>}</TabsContent>
        <TabsContent value="review" className="p-5"><div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4"><div className="flex items-center gap-2 text-sm font-medium text-amber-200"><AlertTriangle className="size-4" /> Primary risk</div><p className="mt-2 text-sm leading-6 text-slate-300">{selected.risk || "No unresolved risk has been recorded."}</p></div><div className="mt-5 space-y-3 text-sm"><ReviewLine ok={selected.dependencies.length > 0 || selected.kind === "Definition"} text="Supporting claims identified" /><ReviewLine ok={selected.evidence >= 2} text="Independent evidence attached" /><ReviewLine ok={selected.status === "verified"} text="Formal review complete" /></div><Button onClick={challengeClaim} variant="outline" className="mt-6 w-full border-rose-400/25 text-rose-200 hover:bg-rose-400/10"><ShieldAlert /> Record challenge</Button></TabsContent>
      </Tabs>}</aside>
    </div>
    {notice && <button onClick={() => setNotice("")} className="fixed bottom-5 right-5 rounded-lg border border-emerald-400/20 bg-[#111923] px-4 py-3 text-sm shadow-2xl"><span className="mr-2 text-emerald-300">✓</span>{notice}</button>}
  </main>;
}

function ReviewLine({ ok, text }: { ok: boolean; text: string }) { return <div className="flex items-center gap-3 rounded-lg border border-white/8 p-3">{ok ? <Check className="size-4 text-emerald-300" /> : <CircleDashed className="size-4 text-amber-300" />}<span className="text-slate-300">{text}</span></div>; }
