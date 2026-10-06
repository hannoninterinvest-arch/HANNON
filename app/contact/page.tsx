"use client";

import { FormEvent, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { InquiryType } from "@/lib/types";

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
    <main className="flex min-h-[70vh] items-center justify-center bg-ivory px-6 py-16">
      <div className="card-shadow w-full max-w-lg rounded-[6px] bg-white p-8">
        <div className="eyebrow">Contact</div>
        <h1 className="mt-2 font-serif text-3xl text-navy-900">
          Envoyez votre proposition ou votre question
        </h1>
        <p className="mt-2 text-sm text-muted-dark">
          Aucun compte n&apos;est nécessaire.
        </p>

        {done ? (
          <p className="mt-6 rounded-[3px] bg-[#e5f2ea] px-3 py-3 text-sm leading-relaxed text-[#1f6b3a]">
            {SUCCESS}
          </p>
        ) : (
          <form onSubmit={onSubmit} className="relative mt-6">
            {error && (
              <p className="mb-4 rounded-[3px] bg-[#f8e4e4] px-3 py-2 text-sm text-[#8a2a2a]">
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
            <label className="block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
              Adresse e-mail
              <input
                required
                type="email"
                autoComplete="email"
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-[3px] border border-[#e4dfd4] px-3 py-2.5 text-sm normal-case tracking-normal text-navy-900 outline-none focus:border-gold-500"
              />
            </label>
            <fieldset className="mt-4">
              <legend className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">
                Type de message
              </legend>
              <div className="mt-2 flex flex-wrap gap-4">
                {(
                  [
                    ["proposition", "Proposition"],
                    ["question", "Question"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 text-sm text-navy-900">
                    <input
                      type="radio"
                      name="type"
                      value={value}
                      checked={type === value}
                      onChange={() => setType(value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="mt-4 block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
              Message
              <textarea
                required
                minLength={5}
                maxLength={5000}
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1.5 w-full rounded-[3px] border border-[#e4dfd4] px-3 py-2.5 text-sm normal-case tracking-normal text-navy-900 outline-none focus:border-gold-500"
              />
            </label>
            <button disabled={busy} className="btn btn-gold mt-6 w-full justify-center">
              {busy ? "Envoi…" : "Envoyer"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
