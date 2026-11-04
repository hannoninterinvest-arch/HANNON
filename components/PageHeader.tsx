"use client";

import type { ReactNode } from "react";
import Breadcrumbs, { type Crumb } from "./Breadcrumbs";
import { useLocale } from "./LocaleProvider";

const presets: Record<string, { eyebrow:string; title:string; description:string }> = {
  "About Us": {eyebrow:"aboutEyebrow",title:"aboutTitle",description:"aboutBody"},
  "Services": {eyebrow:"servicesEyebrow",title:"servicesTitle",description:"servicesBody"},
  "Mandates": {eyebrow:"projectsEyebrow",title:"projectsTitle",description:"projectsBody"},
  "Global Reach": {eyebrow:"globalEyebrow",title:"globalTitle",description:"globalBody"},
  "Contact": {eyebrow:"contactEyebrow",title:"contactPageTitle",description:"contactPageDescription"},
};

export default function PageHeader({eyebrow,title,description,children,crumbs}:{eyebrow:string;title:ReactNode;description?:string;children?:ReactNode;crumbs?:Crumb[]}) {
  const {t}=useLocale();
  const preset=presets[eyebrow];
  return <section className="relative overflow-hidden bg-[#061439] text-white">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_85%_0%,rgba(216,175,106,.23),transparent_60%),radial-gradient(50%_100%_at_0%_100%,rgba(22,48,79,.9),transparent_70%)]"/>
    <div className="grid-pattern pointer-events-none absolute inset-0"/>
    <div className="section-pad relative mx-auto max-w-wrap py-14 sm:py-20">
      {crumbs&&<Breadcrumbs items={crumbs} className="mb-6"/>}
      <div className="eyebrow anim-fade-up text-[#e5c98f]">{preset?t(preset.eyebrow):eyebrow}</div>
      <h1 className="display anim-fade-up mt-4 max-w-3xl text-[38px] sm:text-5xl lg:text-[58px]" style={{animationDelay:"100ms"}}>{preset?t(preset.title):title}</h1>
      {description&&<p className="anim-fade-up mt-5 max-w-2xl text-[15px] leading-[1.9] text-white/70 sm:text-base" style={{animationDelay:"200ms"}}>{preset?t(preset.description):description}</p>}
      {children}
    </div><div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d8af6a]/70 to-transparent"/>
  </section>;
}
