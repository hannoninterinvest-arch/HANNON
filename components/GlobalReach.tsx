"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { useLocale } from "./LocaleProvider";

export default function GlobalReach() {
  const { t, locale } = useLocale();
  const regions = locale==="ar" ? ["تونس","إفريقيا","الشرق الأوسط","أوروبا","آسيا"] : locale==="fr" ? ["Tunisie","Afrique","Moyen-Orient","Europe","Asie"] : ["Tunisia","Africa","Middle East","Europe","Asia"];
  return <section className="grid bg-[#061439] text-white lg:grid-cols-2">
    <div id="reach" className="relative flex flex-col overflow-hidden border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
      <div className="relative z-[1] px-5 pt-16 sm:px-12 sm:pt-24"><Reveal>
        <div className="eyebrow text-[#e5c98f]">{t("globalEyebrow")}</div>
        <h2 className="display mt-4 max-w-xl text-[34px] text-white sm:text-[44px]">{t("globalTitle")}</h2>
        <p className="mt-5 max-w-[480px] text-[15px] leading-[1.95] text-white/70">{t("globalBody")}</p>
        <ul className="mt-6 flex flex-wrap gap-2">{regions.map(r=><li key={r} className="rounded-full border border-[#d8af6a]/35 bg-[#d8af6a]/[.08] px-4 py-2 text-xs font-medium text-[#f0d29b]">{r}</li>)}</ul>
        <Link href="/contact" className="btn btn-outline mt-7">{t("globalButton")} <span aria-hidden>←</span></Link>
      </Reveal></div>
      <div className="relative mt-12 h-[250px] w-full sm:h-[330px]"><Image src="https://res.cloudinary.com/dbzweuzla/image/upload/v1786403692/footer_dyjgmz.webp" alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-center"/><div className="absolute inset-0 bg-gradient-to-t from-[#061439] via-[#061439]/10 to-transparent"/><div className="absolute inset-0 bg-[#d8af6a]/[.06]"/></div>
    </div>
    <div id="leadership" className="relative flex flex-col justify-center overflow-hidden px-5 py-16 sm:px-12 sm:py-24">
      <div className="pointer-events-none absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-[#d8af6a]/15 blur-3xl"/>
      <Reveal className="relative z-[1]"><div className="eyebrow text-[#e5c98f]">{t("leadership")}</div>
        <div className="glass mt-6 grid gap-6 rounded-3xl border-[#d8af6a]/20 p-5 sm:grid-cols-[180px_1fr] sm:items-center sm:gap-8 sm:p-7">
          <div className="relative mx-auto aspect-[4/5] w-[180px] overflow-hidden rounded-2xl border border-[#d8af6a]/50 shadow-xl sm:mx-0 sm:w-full"><Image src="https://res.cloudinary.com/dbzweuzla/image/upload/v1786403136/WhatsApp_Image_2026-08-07_at_10.32.35_kzawur.jpg" alt="Riadh Ibn Chaouaa" fill sizes="180px" className="object-cover"/></div>
          <div className="text-center sm:text-start"><h3 className="font-serif text-[28px] font-semibold leading-tight text-white">Riadh IBN CHAOUAA</h3><div className="mb-3 mt-1.5 text-[11px] font-semibold uppercase tracking-[.18em] text-[#e5c98f]">{t("managingDirector")}</div><p className="text-sm leading-[1.9] text-white/70">{t("leaderBody")}</p><Link href="/about" className="btn btn-outline mt-5">{t("profile")} <span aria-hidden>←</span></Link></div>
        </div>
      </Reveal>
    </div>
  </section>;
}
