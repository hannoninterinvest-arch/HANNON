"use client";

import Reveal from "./Reveal";
import { useLocale } from "./LocaleProvider";

const icons = [
  <path d="M3 21h18M4 21V9l8-5 8 5v12M9 21v-6h6v6" />,
  <><path d="M8 12h.01M2 12l4-2 3 2 3-4 3 3 4-2 3 3" /><path d="M11 15c1 1 3 1 4 0M9 13l-3 3 3 3M15 13l3 3-3 3" /></>,
  <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 4 5.7 4 9s-1.5 6.4-4 9" /></>,
  <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />,
];

export default function TrustBar() {
  const { t } = useLocale();
  const items = ["trust1","trust2","trust3","trust4"];
  return <div className="border-b border-white/10 bg-[#0b204d]">
    <div className="section-pad mx-auto max-w-wrap py-7 sm:py-8"><Reveal>
      <p className="mb-5 text-center text-[11px] font-semibold tracking-wide text-[#e5c98f]">{t("trust")}</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{items.map((key,i)=><div key={key} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.035] px-3 py-3 text-xs leading-relaxed text-white/80 sm:px-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d8af6a]/45 text-[#e5c98f]"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">{icons[i]}</svg></span>{t(key)}
      </div>)}</div>
    </Reveal></div>
  </div>;
}
