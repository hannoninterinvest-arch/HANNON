"use client";

import Link from "next/link";
import { useLocale } from "./LocaleProvider";

export default function PremiumFooter() {
  const { t } = useLocale();
  return <footer className="relative bg-[#061439] pt-14 text-white/75">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8af6a]/70 to-transparent" />
    <div className="section-pad mx-auto grid max-w-wrap gap-10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
      <div><Link href="/" className="font-serif text-2xl font-bold tracking-[.2em] text-white">HANNON</Link><p className="mt-4 max-w-sm text-sm leading-7">{t("footerTagline")}</p><p className="mt-4 text-xs text-white/55">حانون للإستثمارات العالمية · HANNON INTERNATIONAL INVESTMENTS LTD</p></div>
      <div><h2 className="mb-4 text-xs font-semibold uppercase tracking-[.18em] text-[#d8af6a]">{t("quickLinks")}</h2><div className="grid gap-3 text-sm">{[["/","home"],["/about","about"],["/services","services"],["/projects","projects"],["/global-reach","reach"]].map(([href,key])=><Link key={href} href={href} className="transition hover:text-[#f0d29b]">{t(key)}</Link>)}</div></div>
      <div><h2 className="mb-4 text-xs font-semibold uppercase tracking-[.18em] text-[#d8af6a]">{t("contact")}</h2><a className="block text-sm hover:text-white" href="mailto:contact@hannoninterinvest.com">contact@hannoninterinvest.com</a><p className="mt-3 text-sm">Immeuble Saadi, Tour EF, Menzah 4<br/>Tunis 1082, Tunisie</p><a href="https://www.hannoninterinvest.com" className="mt-3 inline-block text-sm text-[#f0d29b]">www.hannoninterinvest.com</a></div>
    </div><div className="border-t border-white/10 py-5 text-center text-xs text-white/45">© {new Date().getFullYear()} HANNON International Investments Ltd</div>
  </footer>;
}
