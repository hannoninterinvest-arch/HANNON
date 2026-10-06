"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { HannonService } from "@/lib/types";
import ServiceCard from "@/components/ServiceCard";

export default function ServicesPage() {
  const [services, setServices] = useState<HannonService[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<HannonService[]>("/services")
      .then(setServices)
      .catch((e) => setError(e instanceof Error ? e.message : "Impossible de charger les services."));
  }, []);

  return (
    <main className="bg-ivory py-16">
      <div className="mx-auto max-w-wrap px-6 lg:px-10">
        <div className="eyebrow">Services</div>
        <h1 className="mt-2 font-serif text-4xl text-navy-900">Services HANNON</h1>
        <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-muted-dark">
          Découvrez les activités publiées par HANNON International Investments.
          Chaque carte ouvre la page du service.
        </p>
        {error && <p className="mt-6 text-sm text-[#8a2a2a]">{error}</p>}
        {!error && services.length === 0 && (
          <p className="mt-8 text-sm text-muted-dark">Aucun service publié pour le moment.</p>
        )}
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
