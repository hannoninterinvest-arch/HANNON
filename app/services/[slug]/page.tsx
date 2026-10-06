"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { HannonService, ServicePlatform } from "@/lib/types";

function platformImages(platform: ServicePlatform) {
  return [platform.imageUrl, platform.secondImageUrl].filter(
    (url): url is string => Boolean(url),
  );
}

function PlatformBlock({ platform }: { platform: ServicePlatform }) {
  const images = platformImages(platform);

  return (
    <article className="card-shadow overflow-hidden rounded-[6px] bg-white">
      {images.length === 1 && (
        <div className="relative h-72 w-full">
          <Image
            src={images[0]}
            alt=""
            fill
            sizes="(min-width: 1024px) 760px, 100vw"
            className="object-cover"
          />
        </div>
      )}
      {images.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {images.slice(0, 2).map((src) => (
            <div key={src} className="relative h-64 w-full">
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
      <div className="p-6 sm:p-7">
        {platform.name ? (
          <h2 className="font-serif text-2xl text-navy-900">{platform.name}</h2>
        ) : null}
        {platform.description ? (
          <p className="mt-3 text-[15px] font-light leading-relaxed text-navy-800">
            {platform.description}
          </p>
        ) : null}
        {platform.link ? (
          <a
            href={platform.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold mt-5"
          >
            Accéder à la plateforme
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default function ServiceDetailPage() {
  const params = useParams<{ slug: string }>();
  const [service, setService] = useState<HannonService | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.slug) return;
    api<HannonService>(`/services/by-slug/${encodeURIComponent(params.slug)}`)
      .then(setService)
      .catch((e) => setError(e instanceof Error ? e.message : "Service introuvable"));
  }, [params.slug]);

  if (error) {
    return (
      <main className="bg-ivory px-6 py-20 text-center text-muted-dark">
        <p>{error}</p>
        <Link href="/services" className="mt-4 inline-block text-gold-500">
          Retour aux services
        </Link>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="bg-ivory px-6 py-20 text-center text-muted-dark">
        Chargement du service…
      </main>
    );
  }

  return (
    <main className="bg-ivory pb-20">
      {service.imageUrl ? (
        <div className="relative h-[360px] w-full overflow-hidden bg-navy-900">
          <Image
            src={service.imageUrl}
            alt={service.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/75 to-navy-900/20" />
          <div className="relative z-[1] mx-auto flex h-full max-w-wrap flex-col justify-end px-6 pb-10 lg:px-10">
            <Link
              href="/services"
              className="mb-4 text-[11px] uppercase tracking-[2px] text-gold-400"
            >
              ← Services
            </Link>
            <h1 className="font-serif text-4xl text-white sm:text-5xl">{service.name}</h1>
          </div>
        </div>
      ) : (
        <div className="bg-navy-900">
          <div className="mx-auto max-w-wrap px-6 py-16 lg:px-10">
            <Link
              href="/services"
              className="text-[11px] uppercase tracking-[2px] text-gold-400"
            >
              ← Services
            </Link>
            <h1 className="mt-4 font-serif text-4xl text-white sm:text-5xl">{service.name}</h1>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-wrap space-y-8 px-6 py-10 lg:px-10">
        {service.description ? (
          <section className="card-shadow rounded-[6px] bg-white p-7">
            <h2 className="text-[11px] font-semibold uppercase tracking-[2px] text-gold-500">
              Présentation
            </h2>
            <p className="mt-4 whitespace-pre-line text-[15px] font-light leading-relaxed text-navy-800">
              {service.description}
            </p>
          </section>
        ) : null}

        {service.platforms?.length ? (
          <section className="space-y-6">
            <h2 className="font-serif text-3xl text-navy-900">
              Plateformes et fonctionnalités
            </h2>
            {service.platforms.map((platform) => (
              <PlatformBlock key={platform.id} platform={platform} />
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
