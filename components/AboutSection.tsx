"use client";

import Link from "next/link";
import { CONTACT, REGIONS, SECTORS, SITE_NAME } from "@/lib/seo";
import Reveal from "./Reveal";
import { useLocale } from "./LocaleProvider";

export const ABOUT_PARAGRAPHS = [
  "HANNON International Investments is a Tunisia-based international investment and business development company focused on identifying, structuring and promoting strategic investment opportunities.",
  "The company connects investors, industrial partners, technology providers and entrepreneurs to develop projects in renewable energy, healthcare, agriculture, artificial intelligence, advanced technologies, international trade, industrial production and infrastructure.",
  "Through international cooperation, project development and strategic partnerships, HANNON aims to transform investment opportunities into sustainable industrial and commercial ventures across Tunisia, Africa, the Middle East and international markets.",
];
export const PILLARS = [
  { title: "Identify", text: "Strategic investment opportunities with industrial and commercial potential." },
  { title: "Structure", text: "Projects shaped with investors, industrial partners and technology providers." },
  { title: "Promote", text: "Opportunities presented to international partners and capital providers." },
];

export default function AboutSection() {
  const { t } = useLocale();
  const steps = [["identify","identifyBody"],["structure","structureBody"],["promote","promoteBody"]] as const;
  return <section id="about" aria-labelledby="about-heading" className="scroll-mt-20 bg-[#fdf0e0] py-16 sm:py-24">
    <div className="section-pad mx-auto max-w-wrap">
      <div className="grid gap-10 lg:grid-cols-[1.25fr_.75fr] lg:gap-16">
        <Reveal><div className="eyebrow">{t("aboutEyebrow")}</div>
          <h2 id="about-heading" className="display mt-4 text-[34px] text-[#061439] sm:text-[48px]">{t("aboutTitle")}</h2>
          <div className="mt-6 space-y-4 text-[15px] leading-[1.95] text-[#34415c] sm:text-base"><p>{t("aboutBody")}</p><p>{t("aboutBody2")}</p><p>{t("aboutBody3")}</p></div>
          <Link href="/about" className="btn btn-outline-navy mt-7">{t("learn")} <span aria-hidden>←</span></Link>
        </Reveal>
        <Reveal delay={120}><aside className="rounded-3xl bg-[#061439] p-7 text-white shadow-[0_24px_70px_rgba(6,20,57,.18)] sm:p-9">
          <h3 className="text-xs font-semibold tracking-[.12em] text-[#e5c98f]">{t("glance")}</h3>
          <dl className="mt-6 space-y-5 text-sm"><div><dt className="text-xs text-white/55">{t("headquarters")}</dt><dd className="mt-1 leading-relaxed">{CONTACT.streetAddress}, {CONTACT.locality} {CONTACT.postalCode}, Tunisie</dd></div><div><dt className="text-xs text-white/55">{t("markets")}</dt><dd className="mt-1 leading-relaxed">{REGIONS.join(" · ")}</dd></div><div><dt className="text-xs text-white/55">{t("contact")}</dt><dd className="mt-1"><a href={`mailto:${CONTACT.email}`} className="text-[#f0d29b] hover:text-white">{CONTACT.email}</a></dd></div></dl>
        </aside></Reveal>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-3">{steps.map(([title,body],i)=><Reveal key={title} delay={i*90} className="h-full"><article className="h-full rounded-2xl border border-[#d8af6a]/30 bg-white p-6 shadow-[0_12px_35px_rgba(6,20,57,.06)]"><span className="font-serif text-4xl font-semibold text-[#b58b4c]/60">0{i+1}</span><h3 className="mt-3 text-xl font-semibold text-[#061439]">{t(title)}</h3><p className="mt-2 text-sm leading-relaxed text-[#536079]">{t(body)}</p></article></Reveal>)}</div>
      <div className="mt-11"><h3 className="text-xs font-semibold uppercase tracking-[.16em] text-[#806338]">{t("servicesEyebrow")}</h3><ul className="mt-4 flex flex-wrap gap-2">{SECTORS.map(s=><li key={s} className="rounded-full border border-[#061439]/10 bg-white/75 px-4 py-2 text-xs text-[#263653]">{s}</li>)}</ul></div>
    </div>
  </section>;
}
