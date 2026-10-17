"use client";

import { FormEvent, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { InquiryType } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

const INFO = [
  {
    label: "E-mail",
    value: "contact@hannoninterinvest.com",
    href: "mailto:contact@hannoninterinvest.com",
    icon: <path d="M3 6l9 7 9-7M3 6v12h18V6" />,
  },
  {
    label: "Téléphone",
    value: "+216 56 147 900",
    href: "tel:+21656147900",
    icon: <path d="M3 5c0 9 7 16 16 16l3-4-6-3-2 2c-3-1.5-5-3.5-6-6l2-2-3-6z" />,
  },
  {
    label: "Adresse",
    value: "Immeuble Saadi, Tour EF, Menzah 4, Tunis 1082 - Tunisie",
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
  "Merci, votre message a bien été reçu. Notre équipe vous répondra à l'adresse e-mail indiquée.";

export default function ContactPage() {
  const startedAt = useRef(Date.now());
  const lock = useRef(false);
  const [email, setEmail] = useState("");
  const [type, setType] = useState<InquiryType>("proposition");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (lock.current || done) return;
    setError("");
    lock.current = true;
    setBusy(true);
    try {
      await api("/inquiries", {
        method: "POST",
        body: JSON.stringify({
          email,
          type,
          message,
          website,
          startedAt: startedAt.current,
        }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer le message.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <main>
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Envoyez votre <span className="gold-text">proposition</span> ou votre question
          </>
        }
        description="Aucun compte n'est nécessaire. Notre équipe vous répondra à l'adresse e-mail indiquée."
      />

      <div className="bg-ivory py-12 sm:py-16">
        <div className="section-pad mx-auto grid max-w-wrap grid-cols-1 gap-8 lg:grid-cols-[1fr_1.35fr] lg:gap-12">
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

          <div className="card-shadow order-1 rounded-3xl bg-white p-6 sm:p-9 lg:order-2">
            <h2 className="font-serif text-[28px] font-semibold text-navy-900">
              Écrivez-nous
            </h2>
            <p className="mt-1.5 text-sm font-light text-muted-dark">
              Tous les champs sont obligatoires.
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
                  <p className="mb-5 rounded-xl bg-[#f8e4e4] px-4 py-3 text-sm text-[#8a2a2a]">
                    {error}
                  </p>
                )}
                <div className="absolute left-[-9999px] h-0 overflow-hidden" aria-hidden="true">
                  <label>
                    Site web
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </label>
                </div>
                <label className="field-label">
                  Adresse e-mail
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field-input"
                  />
                </label>
                <fieldset className="mt-6">
                  <legend className="field-label">Type de message</legend>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {(
                      [
                        ["proposition", "Proposition"],
                        ["question", "Question"],
                      ] as const
                    ).map(([value, label]) => (
                      <label
                        key={value}
                        className={`flex cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
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
                <label className="field-label mt-6">
                  Message
                  <textarea
                    required
                    minLength={5}
                    maxLength={5000}
                    rows={6}
                    placeholder="Décrivez votre proposition ou votre question…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="field-input resize-y"
                  />
                </label>
                <button disabled={busy} className="btn btn-gold mt-7 w-full disabled:opacity-60">
                  {busy ? "Envoi…" : "Envoyer"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
