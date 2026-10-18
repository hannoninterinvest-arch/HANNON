"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { InquiryType, Project } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

const INFO = [
  {
    label: "Email",
    value: "contact@hannoninterinvest.com",
    href: "mailto:contact@hannoninterinvest.com",
    icon: <path d="M3 6l9 7 9-7M3 6v12h18V6" />,
  },
  {
    label: "Phone",
    value: "+216 56 147 900",
    href: "tel:+21656147900",
    icon: <path d="M3 5c0 9 7 16 16 16l3-4-6-3-2 2c-3-1.5-5-3.5-6-6l2-2-3-6z" />,
  },
  {
    label: "Address",
    value: "Immeuble Saadi, Tour EF, Menzah 4, Tunis 1082 - Tunisia",
    href: "",
    icon: (
      <>
        <path d="M12 21s7-6.4 7-12a7 7 0 10-14 0c0 5.6 7 12 7 12z" />
        <circle cx="12" cy="9" r="2.3" />
      </>
    ),
  },
];

const SUCCESS =
  "Thank you, your message has been received. Our team will reply to the email address you provided.";

const TYPES: { value: InquiryType; label: string }[] = [
  { value: "interest", label: "Investment interest" },
  { value: "proposition", label: "Proposal" },
  { value: "question", label: "Question" },
];

const INVESTOR_TYPES = [
  { value: "individual", label: "Individual investor" },
  { value: "family_office", label: "Family office" },
  { value: "fund", label: "Investment fund" },
  { value: "corporate", label: "Corporate" },
  { value: "institution", label: "Institution" },
  { value: "other", label: "Other" },
];
const CONTACT_METHODS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
];
const HORIZONS = ["Under 1 year", "1 to 3 years", "3 to 5 years", "More than 5 years"];

const ACCEPTED = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv", "txt", "png", "jpg", "jpeg", "webp"];
const MAX_FILES = 3;
const MAX_TOTAL = 4 * 1024 * 1024;

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

function ContactForm() {
  const params = useSearchParams();
  const startedAt = useRef(Date.now());
  const lock = useRef(false);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const initialType = params.get("type");
  const [type, setType] = useState<InquiryType>(
    initialType === "interest" || initialType === "question" ? initialType : "proposition",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [budget, setBudget] = useState(params.get("budget") || "");
  const [jobTitle, setJobTitle] = useState("");
  const [country, setCountry] = useState("");
  const [investorType, setInvestorType] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [preferredContact, setPreferredContact] = useState("");
  const [horizon, setHorizon] = useState("");
  const [activities, setActivities] = useState("");
  const [ticketTier, setTicketTier] = useState(params.get("ticket") || "");
  const [projectId, setProjectId] = useState(params.get("project") || "");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const isInterest = type === "interest";
  const selectedProject = projects.find((p) => p.id === projectId);
  const tiers = selectedProject?.ticketTiers || [];

  useEffect(() => {
    api<Project[]>("/projects")
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setError("");
    const next = [...files];
    for (const file of Array.from(list)) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!ACCEPTED.includes(ext)) {
        setError(`“${file.name}” is not an accepted file type (${ACCEPTED.join(", ")}).`);
        continue;
      }
      next.push(file);
    }
    if (next.length > MAX_FILES) {
      setError(`You can attach up to ${MAX_FILES} files.`);
      next.length = MAX_FILES;
    }
    if (next.reduce((sum, f) => sum + f.size, 0) > MAX_TOTAL) {
      setError("The attached files exceed 4 MB in total.");
      return;
    }
    setFiles(next);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (lock.current || done) return;
    setError("");
    lock.current = true;
    setBusy(true);
    try {
      const body = new FormData();
      body.append("type", type);
      body.append("name", name);
      body.append("email", email);
      body.append("phone", phone);
      body.append("company", company);
      body.append("budget", budget);
      body.append("projectId", projectId);
      body.append("jobTitle", jobTitle);
      body.append("country", country);
      body.append("investorType", investorType);
      body.append("websiteUrl", websiteUrl);
      body.append("preferredContact", preferredContact);
      body.append("horizon", horizon);
      body.append("activities", activities);
      body.append("ticketTier", tiers.some((t) => t.label === ticketTier) ? ticketTier : "");
      body.append("message", message);
      body.append("website", website);
      body.append("startedAt", String(startedAt.current));
      files.forEach((file) => body.append("files", file));
      await api("/inquiries", { method: "POST", body });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send the message.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="card-shadow order-1 rounded-3xl bg-white p-6 sm:p-9 lg:order-2">
      <h2 className="font-serif text-[28px] font-semibold text-navy-900">Write to us</h2>
      <p className="mt-1.5 text-sm font-light text-muted-dark">
        Fields marked with * are required.
      </p>

      {done ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#e5f2ea] px-4 py-4 text-sm leading-relaxed text-[#1f6b3a]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 h-5 w-5 shrink-0"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12.5l2.7 2.7L16 9.8" />
          </svg>
          {SUCCESS}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="relative mt-7">
          {error && (
            <p className="mb-5 rounded-xl bg-[#f8e4e4] px-4 py-3 text-sm text-[#8a2a2a]">{error}</p>
          )}
          <div className="absolute left-[-9999px] h-0 overflow-hidden" aria-hidden="true">
            <label>
              Website
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>

          <fieldset>
            <legend className="field-label">I would like to send *</legend>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {TYPES.map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-center text-sm font-medium transition-all duration-200 ${
                    type === value
                      ? "border-gold-500 bg-gold-500/10 text-navy-900 ring-4 ring-gold-500/10"
                      : "border-[#e4dfd4] text-muted-dark hover:border-gold-500/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={value}
                    checked={type === value}
                    onChange={() => setType(value)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="field-label">
              Full name *
              <input
                required
                autoComplete="name"
                maxLength={200}
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-input"
              />
            </label>
            <label className="field-label">
              Email address *
              <input
                required
                type="email"
                autoComplete="email"
                maxLength={254}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
              />
            </label>
            <label className="field-label">
              Phone / WhatsApp
              <input
                type="tel"
                autoComplete="tel"
                maxLength={64}
                placeholder="+216 00 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="field-input"
              />
            </label>
            <label className="field-label">
              Company
              <input
                autoComplete="organization"
                maxLength={200}
                placeholder="Company or institution"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="field-input"
              />
            </label>
            <label className="field-label">
              Job title
              <input
                autoComplete="organization-title"
                maxLength={120}
                placeholder="Managing partner"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="field-input"
              />
            </label>
            <label className="field-label">
              Country
              <input
                autoComplete="country-name"
                maxLength={100}
                placeholder="Country of residence"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="field-input"
              />
            </label>
            <label className="field-label">
              Investor type
              <select value={investorType} onChange={(e) => setInvestorType(e.target.value)} className="field-input">
                <option value="">Select…</option>
                {INVESTOR_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Website or LinkedIn
              <input
                type="url"
                maxLength={300}
                placeholder="https://linkedin.com/in/…"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="field-input"
              />
            </label>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="field-label">
              Project of interest
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="field-input"
              >
                <option value="">No specific project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Investment budget (USD){isInterest ? " *" : ""}
              <input
                required={isInterest}
                type="number"
                inputMode="decimal"
                min={1}
                step="any"
                placeholder="250000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="field-input"
              />
            </label>
            {tiers.length > 0 && (
              <label className="field-label">
                Ticket tier
                <select value={ticketTier} onChange={(e) => setTicketTier(e.target.value)} className="field-input">
                  <option value="">Custom amount</option>
                  {tiers.map((t) => (
                    <option key={t.label} value={t.label}>
                      {t.label} · {Number(t.amount).toLocaleString("en-US")} USD
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="field-label">
              Investment horizon
              <select value={horizon} onChange={(e) => setHorizon(e.target.value)} className="field-input">
                <option value="">Select…</option>
                {HORIZONS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>
            <label className={`field-label ${tiers.length > 0 ? "sm:col-span-2" : ""}`}>
              Preferred contact method
              <select
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value)}
                className="field-input"
              >
                <option value="">No preference</option>
                {CONTACT_METHODS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field-label mt-5">
            About your investment activities
            <textarea
              maxLength={3000}
              rows={4}
              placeholder="Sectors you invest in, typical deal size, track record…"
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              className="field-input resize-y"
            />
          </label>

          <label className="field-label mt-5">
            Message{isInterest ? " (optional)" : " *"}
            <textarea
              required={!isInterest}
              minLength={isInterest ? undefined : 5}
              maxLength={5000}
              rows={6}
              placeholder="Describe your interest, proposal or question…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="field-input resize-y"
            />
          </label>

          <div className="mt-5">
            <div className="field-label">Files about your activities (optional)</div>
            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-gold-500/50 bg-[#fdfcfa] px-4 py-6 text-center transition-colors hover:border-gold-500 hover:bg-gold-500/[0.06]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7 text-gold-500"
              >
                <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
              </svg>
              <span className="text-sm font-medium text-navy-900">Click to add files</span>
              <span className="text-[12px] font-light text-muted-dark">
                Up to {MAX_FILES} files, 4 MB in total. PDF, Word, Excel, PowerPoint, images.
              </span>
              <input
                ref={fileInput}
                type="file"
                multiple
                accept={ACCEPTED.map((ext) => `.${ext}`).join(",")}
                onChange={(e) => addFiles(e.target.files)}
                className="sr-only"
              />
            </label>
            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#efebe3] bg-ivory px-4 py-2.5 text-sm"
                  >
                    <span className="min-w-0 truncate text-navy-900">{file.name}</span>
                    <span className="flex shrink-0 items-center gap-3 text-[12px] text-muted-dark">
                      {formatSize(file.size)}
                      <button
                        type="button"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => setFiles(files.filter((_, i) => i !== index))}
                        className="text-[#8a2a2a] hover:underline"
                      >
                        Remove
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button disabled={busy} className="btn btn-gold mt-7 w-full disabled:opacity-60">
            {busy ? "Sending…" : "Send"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ContactPage() {
  return (
    <main id="main-content">
      <PageHeader
        eyebrow="Contact"
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
        title={
          <>
            Share your <span className="gold-text">interest</span>, proposal or question
          </>
        }
        description="No account is needed. Tell us how to reach you and what you plan to invest, and our team will reply to the email address you provide."
      />

      <div className="bg-ivory py-12 sm:py-16">
        <div className="section-pad mx-auto grid max-w-wrap grid-cols-1 gap-8 lg:grid-cols-[1fr_1.5fr] lg:gap-12">
          <aside className="order-2 space-y-4 lg:order-1">
            {INFO.map((item) => (
              <div
                key={item.label}
                className="card-shadow flex items-start gap-4 rounded-2xl bg-white p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    {item.icon}
                  </svg>
                </span>
                <div className="min-w-0">
                  <div className="text-[10.5px] font-semibold uppercase tracking-[2px] text-gold-500">
                    {item.label}
                  </div>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="mt-1 block break-words text-[14.5px] text-navy-900 hover:text-gold-500"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <div className="mt-1 text-[14.5px] text-navy-900">{item.value}</div>
                  )}
                </div>
              </div>
            ))}
          </aside>

          <Suspense fallback={<div className="card-shadow order-1 h-96 rounded-3xl bg-white lg:order-2" />}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
