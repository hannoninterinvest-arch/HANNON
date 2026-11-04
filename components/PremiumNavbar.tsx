"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useLocale, type Locale } from "./LocaleProvider";

const links = [
  ["/", "home"], ["/about", "about"], ["/services", "services"], ["/projects", "projects"], ["/global-reach", "reach"],
] as const;

export default function PremiumNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();
  const { user, logout } = useAuth();
  const languages: Locale[] = ["ar", "fr", "en"];
  return (
    <header className="sticky top-0 z-[100] border-b border-[#d8af6a]/20 bg-[#061439]/95 text-white shadow-[0_10px_40px_rgba(6,20,57,.16)] backdrop-blur-xl">
      <div className="section-pad mx-auto flex max-w-wrap items-center justify-between gap-4 py-3">
        <Link href="/" aria-label="HANNON — home" className="flex shrink-0 items-center gap-3">
          <span className="relative h-11 w-11">
            <Image src="https://res.cloudinary.com/dbzweuzla/image/upload/v1786402383/logoha_lpe5ct.webp" alt="HANNON" fill sizes="44px" className="object-contain" />
          </span>
          <span><strong className="block font-serif text-xl tracking-[.18em]">HANNON</strong><small className="hidden text-[8px] uppercase tracking-[.2em] text-[#d8af6a] min-[420px]:block">International Investments Ltd</small></span>
        </Link>
        <nav aria-label={t("home")} className="hidden xl:block">
          <ul className="flex items-center gap-6 2xl:gap-8">
            {links.map(([href,key]) => <li key={href}><Link href={href} className={`text-[12px] font-medium transition hover:text-[#f0d29b] ${pathname === href ? "text-[#f0d29b]" : "text-white/75"}`}>{t(key)}</Link></li>)}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full border border-white/15 bg-white/5 p-1" aria-label={t("language")}>
            {languages.map(lang => <button key={lang} onClick={() => setLocale(lang)} aria-pressed={locale === lang} className={`rounded-full px-2.5 py-1.5 text-[10px] font-semibold uppercase transition ${locale === lang ? "bg-[#d8af6a] text-[#061439]" : "text-white/70 hover:text-white"}`}>{lang}</button>)}
          </div>
          <Link href="/contact" className="hidden rounded-full bg-[#d8af6a] px-5 py-2.5 text-xs font-semibold text-[#061439] transition hover:-translate-y-0.5 hover:bg-[#f0d29b] lg:inline-flex">{t("contact")}</Link>
          {user?.role === "admin" && <><Link href="/admin" className="hidden text-xs text-[#f0d29b] 2xl:inline">{t("admin")}</Link><button onClick={logout} className="hidden text-xs text-white/60 2xl:inline">Sign out</button></>}
          <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-[#f0d29b] xl:hidden">{open ? "×" : "☰"}</button>
        </div>
      </div>
      {open && <nav className="border-t border-white/10 bg-[#061439] px-5 py-4 xl:hidden"><ul className="mx-auto flex max-w-wrap flex-col">{links.map(([href,key]) => <li key={href} className="border-b border-white/10"><Link href={href} onClick={() => setOpen(false)} className="block py-3 text-sm text-white/90">{t(key)}</Link></li>)}<li><Link href="/contact" onClick={() => setOpen(false)} className="mt-4 inline-flex rounded-full bg-[#d8af6a] px-5 py-3 text-sm font-semibold text-[#061439]">{t("contact")}</Link></li></ul></nav>}
    </header>
  );
}
