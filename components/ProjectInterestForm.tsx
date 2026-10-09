"use client";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
export default function ProjectInterestForm({ projectId }: { projectId: string }) {
  const [startedAt] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = new FormData(e.currentTarget);
    setBusy(true); setError("");
    try { await api("/inquiries", { method: "POST", body: JSON.stringify({ ...Object.fromEntries(form), type: "proposition", projectId, startedAt }) }); setSent(true); }
    catch (e) { setError(e instanceof Error ? e.message : "Envoi impossible"); }
    finally { setBusy(false); }
  }
  return <div className="card-shadow rounded bg-white p-6"><h3 className="font-serif text-2xl">Je suis intéressé</h3>
    {sent ? <p role="status" className="mt-4 text-green-800">Votre demande a été envoyée à HANNON.</p> : <form className="mt-4 space-y-4" onSubmit={submit}>
      {[["name", "Nom", "text", 180], ["email", "Email", "email", 254], ["phone", "Téléphone", "tel", 64]].map(([name, label, type, max]) => <label key={name} className="block text-sm">{label}<input className="mt-1 w-full rounded border p-3" name={String(name)} type={String(type)} maxLength={Number(max)} required /></label>)}
      <label className="block text-sm">Message (facultatif)<textarea name="message" maxLength={5000} rows={4} className="mt-1 w-full rounded border p-3" /></label>
      <div hidden aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="btn btn-gold w-full">{busy ? "Envoi…" : "Envoyer ma demande"}</button>
    </form>}
  </div>;
}
