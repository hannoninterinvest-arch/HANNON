"use client";

import Link from "next/link";
import type { HannonService } from "@/lib/types";
import { HOME_SERVICES, pickHome } from "@/lib/home";
import Reveal from "./Reveal";
import ServiceCard from "./ServiceCard";
import { useLocale } from "./LocaleProvider";

export default function Services({ services }: { services: HannonService[] }) {
  const { t } = useLocale();
  return <section id="services" className="bg-white py-16 sm:py-24">
    <div className="section-pad mx-auto max-w-wrap">
      <Reveal className="mb-10 grid gap-5 sm:mb-14 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-16">
        <div><div className="eyebrow">{t("servicesEyebrow")}</div><h2 className="display mt-4 max-w-2xl text-[34px] text-[#061439] sm:text-[46px]">{t("servicesTitle")}</h2></div>
        <p className="max-w-2xl text-[15px] leading-[1.9] text-[#536079]">{t("servicesBody")}</p>
      </Reveal>
      {services.length === 0 && <p className="rounded-2xl border border-dashed border-[#d8af6a]/50 bg-[#fdf0e0] px-6 py-10 text-center text-sm text-[#536079]">{t("publishedServices")}</p>}
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">{pickHome(services, HOME_SERVICES).map((service,i)=><Reveal key={service.id} delay={i*55} className="h-full"><ServiceCard service={service} index={i}/></Reveal>)}</div>
      {services.length>0 && <div className="mt-10 text-center"><Link href="/services" className="btn btn-outline-navy">{t("viewServices")} <span aria-hidden>←</span></Link></div>}
    </div>
  </section>;
}
