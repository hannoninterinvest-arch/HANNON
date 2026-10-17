"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Milestone, MilestoneStatus, Project, ProjectStatus, RiskLevel } from "@/lib/types";

type AllocationRow = { label: string; percent: string };
type TierRow = { label: string; amount: string; note: string };
type MilestoneRow = { label: string; date: string; status: MilestoneStatus };

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
  riskLevel: RiskLevel | "";
  instrument: string;
  maxInvestment: string;
  ticketStep: string;
  closingDate: string;
  payoutFrequency: string;
  exitStrategy: string;
  securityGuarantees: string;
  risks: string;
  useOfProceeds: AllocationRow[];
  capitalStructure: AllocationRow[];
  ticketTiers: TierRow[];
  milestones: MilestoneRow[];
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
    riskLevel: project?.riskLevel ?? "",
    instrument: project?.instrument ?? "",
    maxInvestment: project?.maxInvestment != null ? String(Number(project.maxInvestment)) : "",
    ticketStep: project?.ticketStep != null ? String(Number(project.ticketStep)) : "",
    closingDate: project?.closingDate ?? "",
    payoutFrequency: project?.payoutFrequency ?? "",
    exitStrategy: project?.exitStrategy ?? "",
    securityGuarantees: project?.securityGuarantees ?? "",
    risks: (project?.risks ?? []).join("\n"),
    useOfProceeds: (project?.useOfProceeds ?? []).map((r) => ({ label: r.label, percent: String(r.percent) })),
    capitalStructure: (project?.capitalStructure ?? []).map((r) => ({ label: r.label, percent: String(r.percent) })),
    ticketTiers: (project?.ticketTiers ?? []).map((t) => ({ label: t.label, amount: String(t.amount), note: t.note })),
    milestones: (project?.milestones ?? []).map((m: Milestone) => ({ label: m.label, date: m.date, status: m.status })),
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


function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-5 rounded-2xl border border-[#efebe3] p-5 sm:p-6">
      <legend className="px-2 font-serif text-xl font-semibold text-navy-900">{title}</legend>
      {hint && <p className="-mt-2 text-[12.5px] font-light leading-relaxed text-muted-dark">{hint}</p>}
      {children}
    </fieldset>
  );
}

function RowButtons({ onAdd, addLabel }: { onAdd: () => void; addLabel: string }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="rounded-full border border-gold-500/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-gold-500 hover:bg-gold-500 hover:text-navy-900"
    >
      + {addLabel}
    </button>
  );
}

function AllocationEditor({
  rows,
  onChange,
  addLabel,
  placeholder,
}: {
  rows: AllocationRow[];
  onChange: (rows: AllocationRow[]) => void;
  addLabel: string;
  placeholder: string;
}) {
  const total = rows.reduce((sum, r) => sum + (Number(r.percent) || 0), 0);
  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_96px_auto] items-center gap-2">
          <input
            value={row.label}
            placeholder={placeholder}
            onChange={(e) => onChange(rows.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))}
            className="field-input !mt-0"
          />
          <input
            type="number"
            min={0}
            max={100}
            step="any"
            value={row.percent}
            placeholder="%"
            onChange={(e) => onChange(rows.map((r, j) => (j === i ? { ...r, percent: e.target.value } : r)))}
            className="field-input !mt-0"
          />
          <button
            type="button"
            aria-label="Remove row"
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
            className="px-2 text-[#8a2a2a]"
          >
            ✕
          </button>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-4">
        {rows.length < 10 && (
          <RowButtons onAdd={() => onChange([...rows, { label: "", percent: "" }])} addLabel={addLabel} />
        )}
        {rows.length > 0 && (
          <span className={`text-[12px] ${total > 100.01 ? "text-[#8a2a2a]" : "text-muted-dark"}`}>
            Total: {Math.round(total * 100) / 100}% {total > 100.01 ? "(must not exceed 100%)" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

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
        riskLevel: form.riskLevel,
        instrument: form.instrument.trim(),
        maxInvestment: form.maxInvestment.trim(),
        ticketStep: form.ticketStep.trim(),
        closingDate: form.closingDate,
        payoutFrequency: form.payoutFrequency.trim(),
        exitStrategy: form.exitStrategy.trim(),
        securityGuarantees: form.securityGuarantees.trim(),
        risks: form.risks
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        useOfProceeds: form.useOfProceeds
          .filter((r) => r.label.trim())
          .map((r) => ({ label: r.label.trim(), percent: Number(r.percent) || 0 })),
        capitalStructure: form.capitalStructure
          .filter((r) => r.label.trim())
          .map((r) => ({ label: r.label.trim(), percent: Number(r.percent) || 0 })),
        ticketTiers: form.ticketTiers
          .filter((t) => t.label.trim())
          .map((t) => ({ label: t.label.trim(), amount: Number(t.amount), note: t.note.trim() })),
        milestones: form.milestones
          .filter((m) => m.label.trim())
          .map((m) => ({ label: m.label.trim(), date: m.date.trim(), status: m.status })),
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

  const basics = (
    <Section title="Project basics">
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

      <label className="field-label">
        Highlights (comma separated)
        <input
          value={form.highlights}
          onChange={(e) => set("highlights", e.target.value)}
          className="field-input"
        />
      </label>
    </Section>
  );

  const financials = (
    <Section title="Financials">
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
        <label className="field-label">
          Risk level
          <select
            value={form.riskLevel}
            onChange={(e) => set("riskLevel", e.target.value as RiskLevel | "")}
            className="field-input"
          >
            <option value="">Not specified</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className="field-label">
          Instrument
          <input
            placeholder="Senior debt, equity, mezzanine…"
            value={form.instrument}
            onChange={(e) => set("instrument", e.target.value)}
            className="field-input"
          />
        </label>
        <label className="field-label">
          Payout frequency
          <input
            placeholder="Quarterly, annual, at maturity…"
            value={form.payoutFrequency}
            onChange={(e) => set("payoutFrequency", e.target.value)}
            className="field-input"
          />
        </label>
        <label className="field-label">
          Closing date
          <input
            type="date"
            value={form.closingDate}
            onChange={(e) => set("closingDate", e.target.value)}
            className="field-input"
          />
        </label>
      </div>
    </Section>
  );

  const ticket = (
    <Section
      title="Investment ticket"
      hint="The minimum ticket is set in Financials. Add a maximum, an increment and optional ticket tiers. Visitors get a calculator and a comparison chart."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="field-label">
          Maximum ticket (USD)
          <input
            type="number"
            step="any"
            min={0}
            value={form.maxInvestment}
            onChange={(e) => set("maxInvestment", e.target.value)}
            className="field-input"
          />
        </label>
        <label className="field-label">
          Ticket increment (USD)
          <input
            type="number"
            step="any"
            min={0}
            placeholder="e.g. 10000"
            value={form.ticketStep}
            onChange={(e) => set("ticketStep", e.target.value)}
            className="field-input"
          />
        </label>
      </div>
      <div className="space-y-3">
        <div className="field-label">Ticket tiers (up to 6)</div>
        {form.ticketTiers.map((tier, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 rounded-xl bg-ivory p-3 sm:grid-cols-[1fr_140px_auto]">
            <input
              value={tier.label}
              placeholder="Tier name (e.g. Founding investor)"
              onChange={(e) =>
                set("ticketTiers", form.ticketTiers.map((t, j) => (j === i ? { ...t, label: e.target.value } : t)))
              }
              className="field-input !mt-0"
            />
            <input
              type="number"
              step="any"
              min={0}
              value={tier.amount}
              placeholder="Amount (USD)"
              onChange={(e) =>
                set("ticketTiers", form.ticketTiers.map((t, j) => (j === i ? { ...t, amount: e.target.value } : t)))
              }
              className="field-input !mt-0"
            />
            <button
              type="button"
              aria-label="Remove tier"
              onClick={() => set("ticketTiers", form.ticketTiers.filter((_, j) => j !== i))}
              className="px-2 text-[#8a2a2a]"
            >
              ✕
            </button>
            <input
              value={tier.note}
              placeholder="Short description (optional)"
              onChange={(e) =>
                set("ticketTiers", form.ticketTiers.map((t, j) => (j === i ? { ...t, note: e.target.value } : t)))
              }
              className="field-input !mt-0 sm:col-span-3"
            />
          </div>
        ))}
        {form.ticketTiers.length < 6 && (
          <RowButtons
            onAdd={() => set("ticketTiers", [...form.ticketTiers, { label: "", amount: "", note: "" }])}
            addLabel="Add a tier"
          />
        )}
      </div>
    </Section>
  );

  const allocation = (
    <Section
      title="Allocation and structure"
      hint="These rows power the pie charts on the project page. Percentages should add up to 100."
    >
      <div>
        <div className="field-label">Use of proceeds</div>
        <div className="mt-2">
          <AllocationEditor
            rows={form.useOfProceeds}
            onChange={(rows) => set("useOfProceeds", rows)}
            addLabel="Add a line"
            placeholder="e.g. Construction"
          />
        </div>
      </div>
      <div>
        <div className="field-label">Capital structure</div>
        <div className="mt-2">
          <AllocationEditor
            rows={form.capitalStructure}
            onChange={(rows) => set("capitalStructure", rows)}
            addLabel="Add a line"
            placeholder="e.g. Senior debt"
          />
        </div>
      </div>
    </Section>
  );

  const timeline = (
    <Section title="Timeline" hint="Key steps of the project, shown as a timeline (up to 10).">
      <div className="space-y-3">
        {form.milestones.map((m, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 rounded-xl bg-ivory p-3 sm:grid-cols-[1fr_130px_130px_auto]">
            <input
              value={m.label}
              placeholder="Step title"
              onChange={(e) =>
                set("milestones", form.milestones.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
              }
              className="field-input !mt-0"
            />
            <input
              value={m.date}
              placeholder="Q4 2026"
              onChange={(e) =>
                set("milestones", form.milestones.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)))
              }
              className="field-input !mt-0"
            />
            <select
              value={m.status}
              onChange={(e) =>
                set(
                  "milestones",
                  form.milestones.map((x, j) => (j === i ? { ...x, status: e.target.value as MilestoneStatus } : x)),
                )
              }
              className="field-input !mt-0"
            >
              <option value="done">Done</option>
              <option value="active">In progress</option>
              <option value="upcoming">Upcoming</option>
            </select>
            <button
              type="button"
              aria-label="Remove step"
              onClick={() => set("milestones", form.milestones.filter((_, j) => j !== i))}
              className="px-2 text-[#8a2a2a]"
            >
              ✕
            </button>
          </div>
        ))}
        {form.milestones.length < 10 && (
          <RowButtons
            onAdd={() => set("milestones", [...form.milestones, { label: "", date: "", status: "upcoming" }])}
            addLabel="Add a step"
          />
        )}
      </div>
    </Section>
  );

  const riskSection = (
    <Section title="Risks, security and exit">
      <label className="field-label">
        Key risks (one per line)
        <textarea
          rows={4}
          value={form.risks}
          onChange={(e) => set("risks", e.target.value)}
          className="field-input"
        />
      </label>
      <label className="field-label">
        Security and guarantees
        <textarea
          rows={3}
          value={form.securityGuarantees}
          onChange={(e) => set("securityGuarantees", e.target.value)}
          className="field-input"
        />
      </label>
      <label className="field-label">
        Exit strategy
        <textarea
          rows={3}
          value={form.exitStrategy}
          onChange={(e) => set("exitStrategy", e.target.value)}
          className="field-input"
        />
      </label>
    </Section>
  );

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      {error && <p className="rounded-xl bg-[#f8e4e4] px-4 py-3 text-sm text-[#8a2a2a]">{error}</p>}
      {notice && <p className="rounded-xl bg-[#e5f2ea] px-4 py-3 text-sm text-[#1f6b3a]">{notice}</p>}

      <div className="card-shadow space-y-6 rounded-2xl bg-white p-5 sm:p-8">
        {basics}
        {financials}
        {ticket}
        {allocation}
        {timeline}
        {riskSection}

        <Section title="Presentation (Google Drive)">
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
          <p className="text-[12.5px] font-light leading-relaxed text-muted-dark">
            In Google Drive, set the file sharing to <strong>Anyone with the link</strong> (Viewer),
            then paste the link here. Visitors can read the PDF on the project page and download it.
            Leave empty to hide the presentation.
          </p>
        </Section>

        {editing && (
          <Section title="Publication">
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
          </Section>
        )}

        <button disabled={busy} className="btn btn-gold disabled:opacity-60">
          {busy ? "Saving…" : editing ? "Save project" : "Create project"}
        </button>
      </div>
    </form>
  );
}
