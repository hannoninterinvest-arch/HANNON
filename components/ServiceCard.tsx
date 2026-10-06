"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HannonService } from "@/lib/types";

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export default function ServiceCard({
  service,
  index,
}: {
  service: Pick<HannonService, "name" | "slug" | "description" | "imageUrl">;
  index: number;
}) {
  const { ref, inView } = useInView<HTMLAnchorElement>(0.15);
  const initial = service.name.trim().charAt(0) || "H";

  return (
    <Link
      href={`/services/${service.slug}`}
      ref={ref}
      style={{ transitionDelay: inView ? `${index * 90}ms` : "0ms" }}
      className={`card-shadow card-shadow-hover group relative flex flex-col overflow-hidden rounded-[6px] bg-white transition-all duration-700 ease-out
        ${inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        hover:bg-[#faf8f3]`}
    >
      <span
        className="absolute left-0 top-0 z-[1] h-full w-[3px] scale-y-0 bg-gold-500 transition-transform
          duration-300 ease-out group-hover:scale-y-100"
      />

      {service.imageUrl ? (
        <div className="relative h-44 w-full">
          <Image
            src={service.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="px-6 py-[22px]">
        {!service.imageUrl && (
          <div
            className="mb-3 flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#faf3e4]
              font-serif text-lg text-gold-500 transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-gold-500 group-hover:text-white"
          >
            {initial}
          </div>
        )}

        <h3 className="mb-1.5 text-[12.5px] font-bold uppercase tracking-[1px] text-navy-900">
          {service.name}
        </h3>
        {service.description ? (
          <p className="line-clamp-4 text-[13px] font-light leading-[1.5] text-muted-dark">
            {service.description}
          </p>
        ) : null}
        <span className="mt-2 block h-px w-0 bg-gold-500/60 transition-all duration-500 ease-out group-hover:w-8" />
      </div>
    </Link>
  );
}
