"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { HannonService } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
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
    <main>
      <PageHeader
        eyebrow="Services"
        title={
          <>
            Services <span className="gold-text">HANNON</span>
          </>
        }
        description="Découvrez les activités publiées par HANNON International Investments. Chaque carte ouvre la page du service."
      />
      <div className="bg-ivory py-12 sm:py-16">
        <div className="section-pad mx-auto max-w-wrap">
          {error && <p className="text-sm text-[#8a2a2a]">{error}</p>}
          {!error && services.length === 0 && (
            <p className="rounded-2xl border border-dashed border-gold-500/40 bg-white px-6 py-10 text-center text-sm text-muted-dark">
              Aucun service publié pour le moment.
            </p>
          )}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
