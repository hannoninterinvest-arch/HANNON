"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, type Locale } from "./LocaleProvider";

const rotatingHeadlines: Record<Locale, [string, string][]> = {
  ar: [
    ["من الرؤية إلى مشاريع", "ذات أثر مستدام."],
    ["نربط المستثمرين بالشركاء", "لتحويل الفرص إلى إنجازات."],
    ["حانون للإستثمارات العالمية", "نستثمر. نهيكل. نطوّر."],
  ],
  fr: [
    ["De la vision à des projets", "à impact durable."],
    ["Relier les investisseurs", "aux partenaires stratégiques."],
    ["HANNON International", "Investir. Structurer. Développer."],
  ],
  en: [
    ["From vision to projects", "with lasting impact."],
    ["Connecting investors", "with strategic partners."],
    ["HANNON International", "Invest. Structure. Develop."],
  ],
};

const motionLabels: Record<Locale, { pause: string; resume: string }> = {
  ar: { pause: "إيقاف حركة العنوان", resume: "استئناف حركة العنوان" },
  fr: { pause: "Mettre le titre en pause", resume: "Relancer le titre" },
  en: { pause: "Pause rotating headline", resume: "Resume rotating headline" },
};

export default function Hero() {
  const { t, locale } = useLocale();
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pillars = [["pillar1", "pillar1Body", "01"], ["pillar2", "pillar2Body", "02"], ["pillar3", "pillar3Body", "03"]] as const;
  const [headlineTop, headlineGold] = rotatingHeadlines[locale][headlineIndex];

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setHeadlineIndex((index) => (index + 1) % rotatingHeadlines[locale].length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [locale, paused]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) setPaused(true);
    const updatePreference = (event: MediaQueryListEvent) => {
      if (event.matches) setPaused(true);
    };
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  return <section id="home" className="relative isolate overflow-hidden bg-[#061439] text-white">
    <Image src="https://res.cloudinary.com/dbzweuzla/image/upload/v1786386096/630292ea-2558-499a-b414-3180fabd058b.jfif_2K_202608101920_asse86.jpg" alt="" fill priority sizes="100vw" className="-z-30 object-cover object-[70%_center]"/>
    <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(6,20,57,.97)_0%,rgba(6,20,57,.84)_42%,rgba(6,20,57,.40)_100%)]"/>
    <div className="grid-pattern pointer-events-none absolute inset-0 -z-10 opacity-70"/>
    <div className="pointer-events-none absolute -right-24 top-10 -z-10 h-[440px] w-[440px] rounded-full bg-[#d8af6a]/20 blur-3xl"/>
    <div className="section-pad mx-auto flex min-h-[680px] max-w-wrap flex-col justify-center pb-12 pt-16 sm:min-h-[740px] sm:pt-20">
      <div className="max-w-[850px]">
        <div className="anim-fade-up inline-flex items-center gap-2.5 rounded-full border border-[#d8af6a]/45 bg-[#d8af6a]/10 px-4 py-2 text-[11px] font-semibold tracking-wide text-[#f0d29b] backdrop-blur">
          {t("heroEyebrow")}<span className="h-1.5 w-1.5 rounded-full bg-[#d8af6a] shadow-[0_0_12px_#d8af6a]"/>
        </div>
        <h1 aria-live="off" className="mt-7 max-w-[850px] font-serif text-[40px] font-semibold leading-[1.22] tracking-tight text-white sm:text-[56px] lg:text-[70px]">
          <span key={`${locale}-top-${headlineIndex}`} className="hero-title-line hero-title-first block">{headlineTop}</span>
          <span key={`${locale}-gold-${headlineIndex}`} className="hero-title-line hero-title-second mt-1 block text-[#f0d29b]">{headlineGold}</span>
          <span className="mt-5 flex items-center gap-4">
            <span key={`${locale}-rule-${headlineIndex}`} aria-hidden className="hero-title-rule block h-[3px] w-20 rounded-full bg-gradient-to-r from-[#f0d29b] to-[#d8af6a] sm:w-24"/>
            <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? motionLabels[locale].resume : motionLabels[locale].pause} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/[.06] text-[#f0d29b] transition hover:border-[#d8af6a] hover:bg-white/[.12]">
              {paused ? <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M8 5v14l11-7z"/></svg> : <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg>}
            </button>
          </span>
        </h1>
        <p className="anim-fade-up mt-6 max-w-[640px] text-[16px] font-light leading-[1.95] text-white/75 sm:text-[18px]" style={{animationDelay:"240ms"}}>{t("heroBody")}</p>
        <div className="anim-fade-up mt-9 flex flex-col gap-3 sm:flex-row" style={{animationDelay:"340ms"}}>
          <Link href="/projects" className="btn btn-gold">{t("explore")} <span aria-hidden>←</span></Link>
          <Link href="/contact" className="btn btn-outline">{t("proposal")}</Link>
        </div>
      </div>
      <div className="anim-fade-up mt-14 grid gap-3 sm:mt-16 sm:grid-cols-3 sm:gap-4" style={{animationDelay:"460ms"}}>
        {pillars.map(([title, body, number]) => <div key={title} className="glass group flex items-start gap-4 rounded-2xl border-[#d8af6a]/20 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-[#d8af6a]/60">
          <span className="font-serif text-3xl text-[#d8af6a]/70">{number}</span>
          <span><strong className="block text-sm font-semibold text-white">{t(title)}</strong><span className="mt-1.5 block text-[13px] leading-relaxed text-white/65">{t(body)}</span></span>
        </div>)}
      </div>
    </div>
    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d8af6a]/70 to-transparent"/>
  </section>;
}
