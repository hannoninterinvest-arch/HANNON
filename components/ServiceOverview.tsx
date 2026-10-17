"use client";

import Link from "next/link";
import Reveal from "./Reveal";

type Platform = { id: string; name: string };

const BULLET = /^\s*(?:[-•*–]|\d+[.)])\s+/;

export function parseOverview(text: string) {
  const blocks = text
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const paragraphs: string[] = [];
  const points: string[] = [];
  for (const block of blocks) {
    const prose: string[] = [];
    for (const line of block.split("\n")) {
      if (BULLET.test(line)) points.push(line.replace(BULLET, "").trim());
      else if (line.trim()) prose.push(line.trim());
    }
    if (prose.length) paragraphs.push(prose.join(" "));
  }
  return { paragraphs, points };
}

export default function ServiceOverview({
  name,
  description,
  platforms,
}: {
  name: string;
  description: string;
  platforms: Platform[];
}) {
  const { paragraphs, points } = parseOverview(description);
  const [lead, ...rest] = paragraphs;
  const named = platforms.filter((platform) => platform.name?.trim());

  return (
    <Reveal>
      <section className="relative overflow-hidden rounded-3xl bg-navy-900 text-white shadow-[0_30px_80px_-20px_rgba(6,15,30,0.55)] ring-1 ring-gold-500/25">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 90% at 100% 0%, rgba(201,163,92,0.28) 0%, transparent 62%), radial-gradient(45% 80% at 0% 100%, rgba(22,48,79,0.95) 0%, transparent 70%)",
          }}
        />
        <div className="grid-pattern pointer-events-none absolute inset-0 opacity-80" />
        <span
          aria-hidden
          className="pointer-events-none absolute -top-6 right-6 select-none font-serif text-[220px] font-semibold leading-none text-white/[0.04] sm:text-[320px]"
        >
          &rdquo;
        </span>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/70 to-transparent" />

        <div className="relative grid grid-cols-1 gap-10 p-6 sm:p-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14 lg:p-14">
          <div>
            <div className="eyebrow text-gold-400">Overview</div>
            <h2 className="display mt-4 text-[26px] text-white/90 sm:text-[32px]">
              About <span className="gold-text">{name}</span>
            </h2>

            {lead && (
              <p className="mt-7 border-l-2 border-gold-500 pl-5 font-serif text-[22px] font-medium leading-[1.5] text-white sm:pl-7 sm:text-[28px] first-letter:text-gold-300">
                {lead}
              </p>
            )}

            {rest.length > 0 && (
              <div className="mt-8 space-y-5 text-[15px] font-light leading-[1.9] text-[#c3cfe0] sm:text-base lg:columns-2 lg:gap-10 lg:space-y-0 [&>p]:mb-5 [&>p]:break-inside-avoid-column">
                {rest.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}

            {points.length > 0 && (
              <div className="mt-10">
                <div className="text-[11px] font-semibold uppercase tracking-[2.5px] text-gold-400">
                  Key points
                </div>
                <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {points.map((point, i) => (
                    <li
                      key={i}
                      className="glass group flex items-start gap-3.5 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-500/50 hover:bg-white/[0.1]"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-gold-300 transition-colors group-hover:bg-gold-500 group-hover:text-navy-900">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5"
                        >
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <span className="text-[14.5px] leading-relaxed text-white/90">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="lg:pt-2">
            <div className="glass rounded-3xl p-6 sm:p-7 lg:sticky lg:top-28">
              <div className="text-[11px] font-semibold uppercase tracking-[2.5px] text-gold-400">
                At a glance
              </div>

              <div className="mt-5 flex items-end gap-3">
                <span className="gold-text font-serif text-[64px] font-semibold leading-none">
                  {platforms.length}
                </span>
                <span className="pb-2 text-[12px] font-semibold uppercase leading-snug tracking-[2px] text-muted">
                  {platforms.length === 1 ? "platform" : "platforms"}
                  <br />
                  available
                </span>
              </div>

              {named.length > 0 && (
                <ul className="mt-6 space-y-2">
                  {named.map((platform, i) => (
                    <li key={platform.id}>
                      <a
                        href={`#platform-${platform.id}`}
                        className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[13.5px] text-white/90 transition-all hover:border-gold-500/50 hover:bg-gold-500/10 hover:text-gold-300"
                      >
                        <span className="font-serif text-sm text-gold-400">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{platform.name}</span>
                        <span
                          aria-hidden
                          className="text-gold-500 transition-transform duration-300 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              <div className="my-6 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

              <p className="text-[13.5px] font-light leading-relaxed text-muted">
                Interested in this service? Tell us about your project and our team will get back
                to you.
              </p>
              <Link href="/contact?type=proposition" className="btn btn-gold mt-5 w-full">
                Send a proposal <span aria-hidden>→</span>
              </Link>
              <Link href="/contact?type=question" className="btn btn-outline mt-3 w-full">
                Ask a question
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </Reveal>
  );
}
