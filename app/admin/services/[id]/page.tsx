"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { api, uploadServiceImage } from "@/lib/api";
import type { HannonService, PublishStatus, ServicePlatform } from "@/lib/types";

type PlatformDraft = {
  id?: string;
  name: string;
  description: string;
  link: string;
  imageUrl: string;
  imagePublicId: string;
  secondImageUrl: string;
  secondImagePublicId: string;
  sortOrder: string;
  status: PublishStatus;
};

const fieldClass =
  "mt-1.5 w-full rounded-[3px] border border-[#e4dfd4] px-3 py-2.5 text-sm normal-case tracking-normal outline-none focus:border-gold-500";

function toDraft(platform: ServicePlatform): PlatformDraft {
  return {
    id: platform.id,
    name: platform.name || "",
    description: platform.description || "",
    link: platform.link || "",
    imageUrl: platform.imageUrl || "",
    imagePublicId: platform.imagePublicId || "",
    secondImageUrl: platform.secondImageUrl || "",
    secondImagePublicId: platform.secondImagePublicId || "",
    sortOrder: String(platform.sortOrder ?? 0),
    status: platform.status || "draft",
  };
}

function emptyDraft(sortOrder: number): PlatformDraft {
  return {
    name: "",
    description: "",
    link: "",
    imageUrl: "",
    imagePublicId: "",
    secondImageUrl: "",
    secondImagePublicId: "",
    sortOrder: String(sortOrder),
    status: "draft",
  };
}

function payload(draft: PlatformDraft) {
  return {
    name: draft.name,
    description: draft.description,
    link: draft.link || null,
    imageUrl: draft.imageUrl || null,
    imagePublicId: draft.imagePublicId || null,
    secondImageUrl: draft.secondImageUrl || null,
    secondImagePublicId: draft.secondImagePublicId || null,
    sortOrder: Number(draft.sortOrder || 0),
    status: draft.status,
  };
}

export default function EditServicePage() {
  const params = useParams<{ id: string }>();
  const [service, setService] = useState<HannonService | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [status, setStatus] = useState<PublishStatus>("draft");
  const [imageUrl, setImageUrl] = useState("");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState("");
  const [platforms, setPlatforms] = useState<PlatformDraft[]>([]);
  const [creating, setCreating] = useState<PlatformDraft | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const data = await api<HannonService>(`/services/admin/${params.id}`);
    setService(data);
    setName(data.name);
    setDescription(data.description || "");
    setSortOrder(String(data.sortOrder ?? 0));
    setStatus(data.status || "draft");
    setImageUrl(data.imageUrl || "");
    setCloudinaryPublicId(data.cloudinaryPublicId || "");
    setPlatforms((data.platforms || []).map(toDraft));
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Service introuvable"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function onImage(file: File | null, assign: (url: string, id: string) => void) {
    if (!file) return;
    setError("");
    try {
      const uploaded = await uploadServiceImage(file);
      assign(uploaded.imageUrl, uploaded.cloudinaryPublicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi de l'image");
    }
  }

  async function saveService(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await api(`/services/${params.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name,
          description,
          sortOrder: Number(sortOrder || 0),
          status,
          imageUrl: imageUrl || null,
          cloudinaryPublicId: cloudinaryPublicId || null,
        }),
      });
      setNotice("Service enregistré.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setBusy(false);
    }
  }

  function updatePlatform(index: number, patch: Partial<PlatformDraft>) {
    setPlatforms((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function savePlatform(draft: PlatformDraft) {
    if (!draft.id) return;
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await api(`/services/${params.id}/platforms/${draft.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload(draft)),
      });
      setNotice("Plateforme enregistrée.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setBusy(false);
    }
  }

  async function removePlatform(draft: PlatformDraft) {
    if (!draft.id) return;
    const label = draft.name.trim() || "cette plateforme";
    if (!confirm(`Supprimer ${label} ? Cette action est définitive.`)) return;
    setError("");
    try {
      await api(`/services/${params.id}/platforms/${draft.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
    }
  }

  async function createPlatform(e: FormEvent) {
    e.preventDefault();
    if (!creating) return;
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await api(`/services/${params.id}/platforms`, {
        method: "POST",
        body: JSON.stringify(payload(creating)),
      });
      setCreating(null);
      setNotice("Plateforme créée.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Création impossible");
    } finally {
      setBusy(false);
    }
  }

  if (!service && !error) {
    return (
      <DashboardShell title="Service">
        <p className="text-sm text-muted-dark">Chargement…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={name || "Service"}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/services" className="text-[11px] uppercase tracking-[1.5px] text-gold-500">
          ← Tous les services
        </Link>
        {service?.status === "published" && service.slug && (
          <Link
            href={`/services/${service.slug}`}
            className="text-[11px] uppercase tracking-[1.5px] text-navy-800"
          >
            Voir la page publique
          </Link>
        )}
      </div>
      {error && <p className="mb-4 text-sm text-[#8a2a2a]">{error}</p>}
      {notice && <p className="mb-4 text-sm text-[#1f6b3a]">{notice}</p>}

      <form onSubmit={saveService} className="card-shadow max-w-3xl space-y-4 rounded-[6px] bg-white p-6">
        <label className="block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Photo principale
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              onImage(e.target.files?.[0] || null, (url, id) => {
                setImageUrl(url);
                setCloudinaryPublicId(id);
              })
            }
            className="mt-2 block w-full text-sm normal-case tracking-normal"
          />
        </label>
        {imageUrl && (
          <div className="flex items-center gap-4">
            <p className="text-xs text-[#1f6b3a]">Photo prête à être enregistrée.</p>
            <button
              type="button"
              onClick={() => {
                setImageUrl("");
                setCloudinaryPublicId("");
              }}
              className="text-[11px] uppercase tracking-[1px] text-[#8a2a2a]"
            >
              Retirer
            </button>
          </div>
        )}
        <label className="block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Nom
          <input required maxLength={180} value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
        </label>
        <label className="block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Description
          <textarea
            rows={5}
            maxLength={8000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={fieldClass}
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
            Ordre d&apos;affichage
            <input
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
            Statut
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PublishStatus)}
              className={`${fieldClass} bg-white`}
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </label>
        </div>
        <button disabled={busy} className="btn btn-gold">
          {busy ? "Enregistrement…" : "Enregistrer le service"}
        </button>
      </form>

      <section className="mt-10 max-w-3xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl text-navy-900">Plateformes</h2>
          {!creating && (
            <button
              onClick={() => setCreating(emptyDraft(platforms.length))}
              className="btn btn-outline-navy px-4 py-2 text-[10px]"
            >
              Ajouter
            </button>
          )}
        </div>
        <p className="mb-4 text-sm text-muted-dark">
          Deux images maximum, toutes deux facultatives. Le bouton public n&apos;apparaît que si un lien est renseigné.
        </p>

        <div className="space-y-4">
          {platforms.map((draft, index) => (
            <PlatformEditor
              key={draft.id || index}
              draft={draft}
              busy={busy}
              onChange={(patch) => updatePlatform(index, patch)}
              onImage={(file, slot) =>
                onImage(file, (url, id) =>
                  updatePlatform(
                    index,
                    slot === 1
                      ? { imageUrl: url, imagePublicId: id }
                      : { secondImageUrl: url, secondImagePublicId: id },
                  ),
                )
              }
              onClearImage={(slot) =>
                updatePlatform(
                  index,
                  slot === 1
                    ? { imageUrl: "", imagePublicId: "" }
                    : { secondImageUrl: "", secondImagePublicId: "" },
                )
              }
              onSave={() => savePlatform(draft)}
              onDelete={() => removePlatform(draft)}
            />
          ))}
        </div>

        {creating && (
          <form onSubmit={createPlatform} className="card-shadow mt-4 space-y-4 rounded-[6px] bg-white p-5">
            <h3 className="font-serif text-xl">Nouvelle plateforme</h3>
            <PlatformFields
              draft={creating}
              onChange={(patch) => setCreating({ ...creating, ...patch })}
              onImage={(file, slot) =>
                onImage(file, (url, id) =>
                  setCreating((current) =>
                    current
                      ? {
                          ...current,
                          ...(slot === 1
                            ? { imageUrl: url, imagePublicId: id }
                            : { secondImageUrl: url, secondImagePublicId: id }),
                        }
                      : current,
                  ),
                )
              }
              onClearImage={(slot) =>
                setCreating((current) =>
                  current
                    ? {
                        ...current,
                        ...(slot === 1
                          ? { imageUrl: "", imagePublicId: "" }
                          : { secondImageUrl: "", secondImagePublicId: "" }),
                      }
                    : current,
                )
              }
            />
            <div className="flex gap-3">
              <button disabled={busy} className="btn btn-gold">
                Créer
              </button>
              <button type="button" onClick={() => setCreating(null)} className="text-sm text-muted-dark">
                Annuler
              </button>
            </div>
          </form>
        )}
      </section>
    </DashboardShell>
  );
}

function PlatformEditor({
  draft,
  busy,
  onChange,
  onImage,
  onClearImage,
  onSave,
  onDelete,
}: {
  draft: PlatformDraft;
  busy: boolean;
  onChange: (patch: Partial<PlatformDraft>) => void;
  onImage: (file: File | null, slot: 1 | 2) => void;
  onClearImage: (slot: 1 | 2) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="card-shadow space-y-4 rounded-[6px] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-serif text-xl">{draft.name.trim() || "À renseigner"}</h3>
        <StatusBadge status={draft.status} />
      </div>
      <PlatformFields draft={draft} onChange={onChange} onImage={onImage} onClearImage={onClearImage} />
      <div className="flex gap-4">
        <button type="button" disabled={busy} onClick={onSave} className="btn btn-gold">
          Enregistrer
        </button>
        <button type="button" onClick={onDelete} className="text-[11px] uppercase tracking-[1.5px] text-[#8a2a2a]">
          Supprimer
        </button>
      </div>
    </div>
  );
}

function PlatformFields({
  draft,
  onChange,
  onImage,
  onClearImage,
}: {
  draft: PlatformDraft;
  onChange: (patch: Partial<PlatformDraft>) => void;
  onImage: (file: File | null, slot: 1 | 2) => void;
  onClearImage: (slot: 1 | 2) => void;
}) {
  return (
    <>
      <label className="block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
        Nom
        <input
          maxLength={180}
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className={fieldClass}
        />
      </label>
      <label className="block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
        Description
        <textarea
          rows={4}
          maxLength={8000}
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className={fieldClass}
        />
      </label>
      <label className="block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
        Lien (facultatif)
        <input
          type="url"
          maxLength={500}
          placeholder="https://"
          value={draft.link}
          onChange={(e) => onChange({ link: e.target.value })}
          className={fieldClass}
        />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ImageSlot
          label="Image 1 (facultative)"
          url={draft.imageUrl}
          onFile={(file) => onImage(file, 1)}
          onClear={() => onClearImage(1)}
        />
        <ImageSlot
          label="Image 2 (facultative)"
          url={draft.secondImageUrl}
          onFile={(file) => onImage(file, 2)}
          onClear={() => onClearImage(2)}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Ordre d&apos;affichage
          <input
            type="number"
            min={0}
            value={draft.sortOrder}
            onChange={(e) => onChange({ sortOrder: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Statut
          <select
            value={draft.status}
            onChange={(e) => onChange({ status: e.target.value as PublishStatus })}
            className={`${fieldClass} bg-white`}
          >
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
          </select>
        </label>
      </div>
    </>
  );
}

function ImageSlot({
  label,
  url,
  onFile,
  onClear,
}: {
  label: string;
  url: string;
  onFile: (file: File | null) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
        {label}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
          className="mt-2 block w-full text-sm normal-case tracking-normal"
        />
      </label>
      {url ? (
        <button type="button" onClick={onClear} className="mt-2 text-[11px] uppercase tracking-[1px] text-[#8a2a2a]">
          Retirer cette image
        </button>
      ) : null}
    </div>
  );
}
