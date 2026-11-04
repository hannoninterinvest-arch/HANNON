"use client";

import Link from "next/link";
import Reveal from "./Reveal";
import { useLocale } from "./LocaleProvider";

export default function CtaBand() {
  const { t } = useLocale();
  return <section className="relative overflow-hidden bg-[#061439]">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(216,175,106,.22),transparent_64%)]"/><div className="grid-pattern pointer-events-none absolute inset-0 opacity-60"/>
    <div className="section-pad relative mx-auto max-w-wrap py-16 sm:py-24"><Reveal className="mx-auto max-w-3xl text-center">
      <div className="eyebrow justify-center text-[#e5c98f]">{t("ctaEyebrow")}</div><h2 className="display mt-5 text-[34px] text-white sm:text-5xl">{t("ctaTitle")}</h2><p className="mx-auto mt-5 max-w-xl text-[15px] leading-[1.9] text-white/70">{t("ctaBody")}</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/contact" className="btn btn-gold">{t("proposal")} <span aria-hidden>←</span></Link><Link href="/services" className="btn btn-outline">{t("discoverServices")}</Link></div>
    </Reveal></div><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8af6a]/70 to-transparent"/>
  </section>;
}
