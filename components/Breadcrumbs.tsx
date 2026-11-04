"use client";

import Link from "next/link";
import { useLocale } from "./LocaleProvider";

export type Crumb = { name: string; href: string };
const keys: Record<string,string> = { Home:"home", About:"about", Services:"services", Projects:"projects", "Global Reach":"reach", Contact:"contact" };

export default function Breadcrumbs({items,className=""}:{items:Crumb[];className?:string}) {
  const {t,locale}=useLocale();
  return <nav aria-label={locale==="ar"?"مسار التنقل":locale==="fr"?"Fil d’Ariane":"Breadcrumb"} className={className}><ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold tracking-wide text-[#e5c98f]">
    {items.map((item,index)=>{const last=index===items.length-1;const label=keys[item.name]?t(keys[item.name]):item.name;return <li key={item.href} className="flex min-w-0 items-center gap-2">{last?<span aria-current="page" className="max-w-[60vw] truncate text-white/70 sm:max-w-none">{label}</span>:<><Link href={item.href} className="transition-colors hover:text-white">{label}</Link><span aria-hidden className="text-white/30">/</span></>}</li>})}
  </ol></nav>;
}
