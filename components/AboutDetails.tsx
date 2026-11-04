"use client";

import Link from "next/link";
import { useLocale } from "./LocaleProvider";

export default function AboutDetails() {
  const { t, locale } = useLocale();
  const sectors = locale==="ar"
    ? ["الطاقة المتجددة","الرعاية الصحية","الفلاحة","الذكاء الاصطناعي","التكنولوجيا المتقدمة","التجارة الدولية","الإنتاج الصناعي","البنية التحتية"]
    : locale==="fr"
    ? ["Énergies renouvelables","Santé","Agriculture","Intelligence artificielle","Technologies avancées","Commerce international","Production industrielle","Infrastructures"]
    : ["Renewable energy","Healthcare","Agriculture","Artificial intelligence","Advanced technologies","International trade","Industrial production","Infrastructure"];
  const regions = locale==="ar" ? "تونس، إفريقيا، الشرق الأوسط، أوروبا وآسيا" : locale==="fr" ? "la Tunisie, l’Afrique, le Moyen-Orient, l’Europe et l’Asie" : "Tunisia, Africa, the Middle East, Europe and Asia";
  const pillars=[["identify","identifyBody"],["structure","structureBody"],["promote","promoteBody"]] as const;
  return <div className="bg-[#fdf0e0] py-14 sm:py-20"><div className="section-pad mx-auto max-w-wrap">
    <section aria-labelledby="who-heading" className="max-w-3xl"><h2 id="who-heading" className="font-serif text-3xl font-semibold text-[#061439] sm:text-4xl">{t("whoWeAre")}</h2>
      <p className="mt-5 text-[15px] leading-[1.95] text-[#34415c] sm:text-base">{t("aboutDetail")}</p>
      <p className="mt-4 text-[15px] leading-[1.95] text-[#34415c] sm:text-base">{t("aboutBody2")}</p>
    </section>
    <section aria-labelledby="what-heading" className="mt-14"><h2 id="what-heading" className="font-serif text-3xl font-semibold text-[#061439] sm:text-4xl">{t("whatWeDo")}</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">{pillars.map(([title,body],i)=><article key={title} className="rounded-2xl border border-[#d8af6a]/30 bg-white p-6 shadow-[0_12px_35px_rgba(6,20,57,.06)]"><div className="font-serif text-4xl font-semibold text-[#b58b4c]/60">0{i+1}</div><h3 className="mt-2 text-xl font-semibold text-[#061439]">{t(title)}</h3><p className="mt-2 text-sm leading-relaxed text-[#536079]">{t(body)}</p></article>)}</div>
    </section>
    <section className="mt-14"><h2 className="font-serif text-3xl font-semibold text-[#061439] sm:text-4xl">{t("sectorsHeading")}</h2><ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{sectors.map(s=><li key={s} className="rounded-2xl border border-[#d8af6a]/25 bg-white px-4 py-5 text-center font-medium text-[#061439] shadow-sm">{s}</li>)}</ul></section>
    <section className="mt-14 max-w-3xl"><h2 className="font-serif text-3xl font-semibold text-[#061439] sm:text-4xl">{t("whereWeOperate")}</h2><p className="mt-5 text-[15px] leading-[1.95] text-[#34415c] sm:text-base">{locale==="ar" ? "انطلاقاً من تونس، تعمل حانون مع شركاء في " : locale==="fr" ? "Depuis Tunis, HANNON travaille avec des partenaires dans " : "From Tunis, HANNON works with partners across "}{regions}.</p><div className="mt-5 flex flex-wrap gap-5 text-sm font-semibold text-[#8c6939]"><Link href="/global-reach">{t("reach")}</Link><Link href="/services">{t("services")}</Link><Link href="/projects">{t("projects")}</Link></div></section>
  </div></div>;
}
