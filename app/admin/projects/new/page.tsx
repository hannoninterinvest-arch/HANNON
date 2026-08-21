"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { api } from "@/lib/api";

export default function NewProjectPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState("");
  const [form, setForm] = useState({
    title: "",
    summary: "",
    description: "",
    sector: "",
    location: "",
    targetAmount: "",
    raisedAmount: "0",
    minInvestment: "",
    expectedReturn: "",
    durationMonths: "36",
    highlights: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onFile(file: File | null) {
    if (!file) return;
    try {
      const body = new FormData();
      body.append("file", file);
      const uploaded = await api<{ imageUrl: string; cloudinaryPublicId: string }>(
        "/projects/upload",
        { method: "POST", body },
      );
      setImageUrl(uploaded.imageUrl);
      setCloudinaryPublicId(uploaded.cloudinaryPublicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/projects", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          targetAmount: Number(form.targetAmount),
          raisedAmount: Number(form.raisedAmount || 0),
          minInvestment: Number(form.minInvestment),
          expectedReturn: Number(form.expectedReturn),
          durationMonths: Number(form.durationMonths),
          highlights: form.highlights
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          imageUrl,
          cloudinaryPublicId,
          visible: true,
        }),
      });
      router.push("/admin/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create project");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardShell title="New project">
      <form onSubmit={onSubmit} className="card-shadow max-w-3xl space-y-4 rounded-[6px] bg-white p-6">
        {error && <p className="text-sm text-[#8a2a2a]">{error}</p>}
        <label className="block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Cover image (Cloudinary)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
            className="mt-2 block w-full text-sm normal-case tracking-normal"
          />
        </label>
        {imageUrl && (
          <p className="text-xs text-[#1f6b3a]">Image uploaded to Cloudinary.</p>
        )}
        {[
          ["title", "Title"],
          ["sector", "Sector"],
          ["location", "Location"],
          ["summary", "Summary"],
        ].map(([key, label]) => (
          <label key={key} className="block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
            {label}
            <input
              required
              value={form[key as keyof typeof form]}
              onChange={(e) => set(key as keyof typeof form, e.target.value)}
              className="mt-1.5 w-full rounded-[3px] border border-[#e4dfd4] px-3 py-2.5 text-sm normal-case tracking-normal outline-none focus:border-gold-500"
            />
          </label>
        ))}
        <label className="block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Description
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="mt-1.5 w-full rounded-[3px] border border-[#e4dfd4] px-3 py-2.5 text-sm normal-case tracking-normal outline-none focus:border-gold-500"
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            ["targetAmount", "Target amount (USD)"],
            ["raisedAmount", "Raised so far (USD)"],
            ["minInvestment", "Minimum ticket (USD)"],
            ["expectedReturn", "Expected return (%)"],
            ["durationMonths", "Duration (months)"],
          ].map(([key, label]) => (
            <label key={key} className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
              {label}
              <input
                required
                type="number"
                value={form[key as keyof typeof form]}
                onChange={(e) => set(key as keyof typeof form, e.target.value)}
                className="mt-1.5 w-full rounded-[3px] border border-[#e4dfd4] px-3 py-2.5 text-sm normal-case tracking-normal outline-none focus:border-gold-500"
              />
            </label>
          ))}
        </div>
        <label className="block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Highlights (comma separated)
          <input
            value={form.highlights}
            onChange={(e) => set("highlights", e.target.value)}
            className="mt-1.5 w-full rounded-[3px] border border-[#e4dfd4] px-3 py-2.5 text-sm normal-case tracking-normal outline-none focus:border-gold-500"
          />
        </label>
        <button disabled={busy} className="btn btn-gold">
          {busy ? "Saving…" : "Create project"}
        </button>
      </form>
    </DashboardShell>
  );
}
