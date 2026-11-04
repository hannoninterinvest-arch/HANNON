"use client";

import { useEffect, useState } from "react";
import { useLocale } from "./LocaleProvider";

const marketUrl = "https://www.tunis-stockexchange.com/market-watch";
const newsUrl = "https://tunis-stockexchange.com/actualites-bourse";

const copy = {
  ar: {
    label: "السوق والأخبار",
    market: "مؤشرات بورصة تونس: TUNINDEX وTUNINDEX 20",
    timing: "المؤشرات آنية والأسهم بتأخير 15 دقيقة",
    news: "آخر الأخبار والبلاغات الرسمية",
    pause: "إيقاف الشريط",
    resume: "استئناف الشريط",
  },
  fr: {
    label: "MARCHÉS & ACTUALITÉS",
    market: "Indices de Tunis : TUNINDEX et TUNINDEX 20",
    timing: "Indices en temps réel · Cotations différées de 15 min",
    news: "Dernières actualités et communiqués officiels",
    pause: "Mettre le bandeau en pause",
    resume: "Relancer le bandeau",
  },
  en: {
    label: "MARKETS & NEWS",
    market: "Tunis indices: TUNINDEX and TUNINDEX 20",
    timing: "Indices in real time · Equity prices delayed by 15 min",
    news: "Latest official news and notices",
    pause: "Pause ticker",
    resume: "Resume ticker",
  },
} as const;

export default function MarketTicker() {
  const { locale } = useLocale();
  const [paused, setPaused] = useState(false);
  const text = copy[locale];
  const items = [
    { href: marketUrl, label: text.market, detail: text.timing },
    { href: newsUrl, label: text.news, detail: "" },
  ];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) setPaused(true);
    const updatePreference = (event: MediaQueryListEvent) => {
      if (event.matches) setPaused(true);
    };
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  return <div className="market-ticker" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="market-ticker-label">{text.label}</div>
    <div className="market-ticker-window">
      <div className={`market-ticker-track ${paused ? "is-paused" : ""}`}>
        {[0, 1].map((copyIndex) => <div key={copyIndex} className="market-ticker-group" aria-hidden={copyIndex === 1}>
          {items.map((item, index) => <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="market-ticker-item" tabIndex={copyIndex === 1 ? -1 : undefined}>
            <span className="market-ticker-dot" aria-hidden/>
            <span className="market-ticker-text">{item.label}</span>
            {item.detail && <span className="market-ticker-detail">{item.detail}</span>}
            {index === 0 && <span className="market-ticker-source">BVMT</span>}
          </a>)}
        </div>)}
      </div>
    </div>
    <button type="button" className="market-ticker-toggle" onClick={() => setPaused(value => !value)} aria-label={paused ? text.resume : text.pause} title={paused ? text.resume : text.pause}>
      {paused ? <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-3.5 w-3.5"><path d="M8 5v14l11-7z"/></svg> : <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-3.5 w-3.5"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg>}
    </button>
  </div>;
}
