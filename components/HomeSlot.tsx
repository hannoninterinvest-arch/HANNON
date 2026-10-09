"use client";
import { useState } from "react";
import { api } from "@/lib/api";
export default function HomeSlot({ kind, id, value, onSaved }: { kind: "projects" | "services"; id: string; value: number | null; onSaved: () => void | Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div className="my-3 text-sm"><label>Position sur l’accueil (6 maximum)
    <select className="ml-3 rounded border p-2" value={value ?? ""} disabled={busy} onChange={async e => {
      const slot = e.target.value === "" ? null : Number(e.target.value);
      setBusy(true); setError("");
      try { await api(`/${kind}/${id}/home`, { method: "PATCH", body: JSON.stringify({ homeSlot: slot }) }); await onSaved(); }
      catch (e) { setError(e instanceof Error ? e.message : "Enregistrement impossible"); }
      finally { setBusy(false); }
    }}><option value="">Ne pas afficher</option>{[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}</select>
  </label>{error && <p role="alert" className="text-red-700">{error}</p>}</div>;
}
