"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Project, ProjectStatus } from "@/lib/types";

type FormState = {
  title: string;
  summary: string;
  description: string;
  sector: string;
  location: string;
  targetAmount: string;
  raisedAmount: string;
  minInvestment: string;
  expectedReturn: string;
  durationMonths: string;
  highlights: string;
  presentationUrl: string;
  status: ProjectStatus;
  visible: boolean;
};

function initialState(project?: Project): FormState {
  return {
    title: project?.title ?? "",
    summary: project?.summary ?? "",
    description: project?.description ?? "",
    sector: project?.sector ?? "",
    location: project?.location ?? "",
    targetAmount: project ? String(Number(project.targetAmount)) : "",
    raisedAmount: project ? String(Number(project.raisedAmount)) : "0",
    minInvestment: project ? String(Number(project.minInvestment)) : "",
    expectedReturn: project ? String(Number(project.expectedReturn)) : "",
    durationMonths: project ? String(project.durationMonths) : "36",
    highlights: project?.highlights?.join(", ") ?? "",
    presentationUrl: project?.presentationUrl ?? "",
    status: project?.status ?? "open",
    visible: project?.visible ?? true,
  };
}

const TEXT_FIELDS = [
  ["title", "Title"],
  ["sector", "Sector"],
  ["location", "Location"],
  ["summary", "Summary"],
] as const;

const NUMBER_FIELDS = [
  ["targetAmount", "Target amount (USD)"],
  ["raisedAmount", "Raised so far (USD)"],
  ["minInvestment", "Minimum ticket (USD)"],
  ["expectedReturn", "Expected return (%)"],
  ["durationMonths", "Duration (months)"],
] as const;

export default function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const editing = Boolean(project);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [imageUrl, setImageUrl] = useState(project?.imageUrl ?? "");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState(project?.cloudinaryPublicId ?? "");
  const [form, setForm] = useState<FormState>(() => initialState(project));

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onFile(file: File | null) {
    if (!file) return;
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      if (project) {
        const updated = await api<Project>(`/projects/${project.id}/image`, { method: "POST", body });
        setImageUrl(updated.imageUrl ?? "");
        setCloudinaryPublicId(updated.cloudinaryPublicId ?? "");
        setNotice("Cover image updated.");
      } else {
        const uploaded = await api<{ imageUrl: string; cloudinaryPublicId: string }>(
          "/projects/upload",
          { method: "POST", body },
        );
        setImageUrl(uploaded.imageUrl);
        setCloudinaryPublicId(uploaded.cloudinaryPublicId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const payload = {
        title: form.title,
        summary: form.summary,
        description: form.description,
        sector: form.sector,
        location: form.location,
        targetAmount: Number(form.targetAmount),
        raisedAmount: Number(form.raisedAmount || 0),
        minInvestment: Number(form.minInvestment),
        expectedReturn: Number(form.expectedReturn),
        durationMonths: Number(form.durationMonths),
        highlights: form.highlights
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        presentationUrl: form.presentationUrl.trim(),
        visible: form.visible,
        status: form.status,
      };
      if (project) {
        await api(`/projects/${project.id}`, { method: "PATCH", body: JSON.stringify(payload) });
        setNotice("Project saved.");
      } else {
        await api("/projects", {
          method: "POST",
          body: JSON.stringify({ ...payload, imageUrl, cloudinaryPublicId }),
        });
        router.push("/admin/projects");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save the project");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-shadow max-w-3xl space-y-5 rounded-2xl bg-white p-6 sm:p-8">
      {error && <p className="rounded-xl bg-[#f8e4e4] px-4 py-3 text-sm text-[#8a2a2a]">{error}</p>}
      {notice && <p className="rounded-xl bg-[#e5f2ea] px-4 py-3 text-sm text-[#1f6b3a]">{notice}</p>}

      <div className="field-label">
        Cover image (Cloudinary)
        {imageUrl && (
          <div className="relative mt-2 h-40 w-full max-w-sm overflow-hidden rounded-xl bg-navy-800">
            <Image src={imageUrl} alt="" fill sizes="384px" className="object-cover" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
          className="mt-2 block w-full text-sm normal-case tracking-normal"
        />
      </div>

      {TEXT_FIELDS.map(([key, label]) => (
        <label key={key} className="field-label">
          {label}
          <input
            required
            value={form[key]}
            onChange={(e) => set(key, e.target.value)}
            className="field-input"
          />
        </label>
      ))}

      <label className="field-label">
        Description
        <textarea
          required
          rows={6}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="field-input"
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {NUMBER_FIELDS.map(([key, label]) => (
          <label key={key} className="field-label">
            {label}
            <input
              required
              type="number"
              step="any"
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              className="field-input"
            />
          </label>
        ))}
      </div>

      <label className="field-label">
        Highlights (comma separated)
        <input
          value={form.highlights}
          onChange={(e) => set("highlights", e.target.value)}
          className="field-input"
        />
      </label>

      <div className="rounded-2xl border border-gold-500/30 bg-ivory p-5">
        <label className="field-label">
          Presentation PDF (Google Drive link)
          <input
            type="url"
            inputMode="url"
            placeholder="https://drive.google.com/file/d/…/view"
            value={form.presentationUrl}
            onChange={(e) => set("presentationUrl", e.target.value)}
            className="field-input"
          />
        </label>
        <p className="mt-3 text-[12.5px] font-light leading-relaxed text-muted-dark">
          In Google Drive, set the file sharing to <strong>Anyone with the link</strong> (Viewer),
          then paste the link here. Visitors can read the PDF on the project page and download it.
          Leave empty to hide the presentation.
        </p>
      </div>

      {editing && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="field-label">
            Status
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as ProjectStatus)}
              className="field-input"
            >
              <option value="open">Open</option>
              <option value="funded">Funded</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <label className="mt-6 flex items-center gap-3 text-sm text-navy-900">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => set("visible", e.target.checked)}
              className="h-5 w-5 accent-[#c9a35c]"
            />
            Visible on the public site
          </label>
        </div>
      )}

      <button disabled={busy} className="btn btn-gold disabled:opacity-60">
        {busy ? "Saving…" : editing ? "Save project" : "Create project"}
      </button>
    </form>
  );
}
