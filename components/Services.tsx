"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { HannonService } from "@/lib/types";
import ServiceCard from "./ServiceCard";

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

export default function Services() {
  const { ref: headRef, inView: headInView } = useInView<HTMLDivElement>(0.3);
  const [services, setServices] = useState<HannonService[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<HannonService[]>("/services")
      .then(setServices)
      .catch(() => setError("Les services seront affichés dès que l'API est disponible."));
  }, []);

  return (
    <section id="services" className="bg-white py-10">
      <div className="mx-auto max-w-wrap px-10">
        <div
          ref={headRef}
          className={`mb-6 grid grid-cols-1 items-end gap-[40px] transition-all duration-700 ease-out lg:grid-cols-[1fr_1.4fr]
            ${headInView ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
        >
          <div>
            <div className="eyebrow">Our Services</div>
            <h2 className="mt-2 text-[26px] font-bold uppercase leading-tight text-navy-900 sm:text-[30px]">
              Strategic Solutions.
              <br />
              <span className="text-gold-500">Global Execution.</span>
            </h2>
          </div>
          <p className="text-[13.5px] font-light leading-[1.65] text-muted-dark">
            We provide end-to-end financial advisory services tailored to the
            most complex and high-impact transactions, connecting sovereign
            clients with the capital and partnerships they need to deliver
            lasting impact.
          </p>
        </div>

        {error && <p className="mb-4 text-sm text-muted-dark">{error}</p>}
        {!error && !services.some(s => s.homeSlot != null) && (
          <p className="text-sm font-light text-muted-dark">
            Les services sélectionnés par l’administrateur apparaîtront ici.
          </p>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.filter(s => s.homeSlot != null).sort((a, b) => a.homeSlot! - b.homeSlot!).slice(0, 6).map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
        <Link href="/services" className="btn btn-outline-navy mt-6">Tous les services</Link>
      </div>
    </section>
  );
}
