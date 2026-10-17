"use client";

import Image from "next/image";
import Link from "next/link";
import type { HannonService } from "@/lib/types";
import Reveal from "./Reveal";

export default function ServiceCard({
  service,
  index,
}: {
  service: Pick<HannonService, "name" | "slug" | "description" | "imageUrl">;
  index: number;
}) {
  const initial = service.name.trim().charAt(0) || "H";
  const number = String(index + 1).padStart(2, "0");

  return (
    <Reveal delay={(index % 3) * 90} className="h-full">
      <Link
        href={`/services/${service.slug}`}
        className="card-shadow card-shadow-hover group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white"
      >
        {service.imageUrl ? (
          <div className="relative h-48 w-full overflow-hidden bg-navy-800">
            <Image
              src={service.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent" />
            <span className="absolute left-4 top-4 rounded-full bg-navy-900/70 px-3 py-1 font-serif text-[13px] font-semibold tracking-[1px] text-gold-300 backdrop-blur-md">
              {number}
            </span>
          </div>
        ) : (
          <div className="relative flex h-28 items-center justify-between overflow-hidden bg-navy-800 px-6">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(80% 160% at 100% 0%, rgba(201,163,92,0.3) 0%, transparent 65%)",
              }}
            />
            <span
              className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-500/40 bg-gold-500/10 font-serif text-2xl font-semibold text-gold-300 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-gold-500 group-hover:text-navy-900"
            >
              {initial}
            </span>
            <span className="relative font-serif text-4xl font-semibold text-white/15">{number}</span>
          </div>
        )}

        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-serif text-[22px] font-semibold leading-snug text-navy-900">
            {service.name}
          </h3>
          {service.description ? (
            <p className="mt-2.5 line-clamp-4 text-[14px] font-light leading-[1.7] text-muted-dark">
              {service.description}
            </p>
          ) : null}
          <span className="mt-auto flex items-center gap-2 pt-5 text-[11px] font-semibold uppercase tracking-[2px] text-gold-500">
            Discover
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
            >
              →
            </span>
          </span>
        </div>

        <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-gold-500 to-gold-300 transition-transform duration-500 ease-out group-hover:scale-x-100" />
      </Link>
    </Reveal>
  );
}
