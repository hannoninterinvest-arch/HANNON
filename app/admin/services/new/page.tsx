"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { api, uploadServiceImage } from "@/lib/api";
import type { PublishStatus } from "@/lib/types";

export default function NewServicePage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    sortOrder: "",
    status: "draft" as PublishStatus,
  });

  async function onFile(file: File | null) {
    if (!file) return;
    setError("");
    try {
      const uploaded = await uploadServiceImage(file);
      setImageUrl(uploaded.imageUrl);
      setCloudinaryPublicId(uploaded.cloudinaryPublicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi de l'image");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/services", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          status: form.status,
          sortOrder: form.sortOrder === "" ? undefined : Number(form.sortOrder),
          imageUrl: imageUrl || null,
          cloudinaryPublicId: cloudinaryPublicId || null,
        }),
      });
      router.push("/admin/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer le service");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardShell title="Nouveau service">
      <form onSubmit={onSubmit} className="card-shadow max-w-3xl space-y-4 rounded-[6px] bg-white p-6">
        {error && <p className="text-sm text-[#8a2a2a]">{error}</p>}
        <label className="block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Photo principale
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
            className="mt-2 block w-full text-sm normal-case tracking-normal"
          />
        </label>
        {imageUrl && <p className="text-xs text-[#1f6b3a]">Image enregistrée sur Cloudinary.</p>}
        <label className="block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Nom
          <input
            required
            maxLength={180}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1.5 w-full rounded-[3px] border border-[#e4dfd4] px-3 py-2.5 text-sm normal-case tracking-normal outline-none focus:border-gold-500"
          />
        </label>
        <label className="block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Description
          <textarea
            rows={5}
            maxLength={8000}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="mt-1.5 w-full rounded-[3px] border border-[#e4dfd4] px-3 py-2.5 text-sm normal-case tracking-normal outline-none focus:border-gold-500"
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
            Ordre d&apos;affichage
            <input
              type="number"
              min={0}
              value={form.sortOrder}
              placeholder="Automatique"
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
              className="mt-1.5 w-full rounded-[3px] border border-[#e4dfd4] px-3 py-2.5 text-sm normal-case tracking-normal outline-none focus:border-gold-500"
            />
          </label>
          <label className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
            Statut
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as PublishStatus }))
              }
              className="mt-1.5 w-full rounded-[3px] border border-[#e4dfd4] bg-white px-3 py-2.5 text-sm normal-case tracking-normal outline-none focus:border-gold-500"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </label>
        </div>
        <button disabled={busy} className="btn btn-gold">
          {busy ? "Enregistrement…" : "Créer le service"}
        </button>
      </form>
    </DashboardShell>
  );
}
