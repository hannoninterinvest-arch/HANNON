"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { HannonService, ServicePlatform } from "@/lib/types";
import ServiceOverview from "@/components/ServiceOverview";

function platformImages(platform: ServicePlatform) {
  return [platform.imageUrl, platform.secondImageUrl].filter(
    (url): url is string => Boolean(url),
  );
}

function PlatformBlock({ platform }: { platform: ServicePlatform }) {
  const images = platformImages(platform);

  return (
    <article id={`platform-${platform.id}`} className="card-shadow scroll-mt-28 overflow-hidden rounded-2xl bg-white">
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
      <div className="p-6 sm:p-6 sm:p-8">
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
            Access the platform
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
      .catch((e) => setError(e instanceof Error ? e.message : "Service not found"));
  }, [params.slug]);

  if (error) {
    return (
      <main className="bg-ivory px-6 py-20 text-center text-muted-dark">
        <p>{error}</p>
        <Link href="/services" className="mt-4 inline-block text-gold-500">
          Back to services
        </Link>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="bg-ivory px-6 py-20 text-center text-muted-dark">
        Loading service…
      </main>
    );
  }

  return (
    <main className="bg-ivory pb-20">
      {service.imageUrl ? (
        <div className="relative h-[300px] sm:h-[400px] w-full overflow-hidden bg-navy-900">
          <Image
            src={service.imageUrl}
            alt={service.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/70 to-navy-900/25 sm:bg-gradient-to-r sm:via-navy-900/75 sm:to-navy-900/20" />
          <div className="relative z-[1] mx-auto flex h-full max-w-wrap flex-col justify-end px-6 pb-16 sm:pb-20 lg:px-10">
            <Link
              href="/services"
              className="mb-4 text-[11px] font-semibold uppercase tracking-[2px] text-gold-400 transition-colors hover:text-gold-300"
            >
              ← Services
            </Link>
            <h1 className="display text-[34px] text-white sm:text-5xl lg:text-6xl">{service.name}</h1>
          </div>
        </div>
      ) : (
        <div className="bg-navy-900">
          <div className="mx-auto max-w-wrap px-6 pb-24 pt-16 lg:px-10">
            <Link
              href="/services"
              className="text-[11px] uppercase tracking-[2px] text-gold-400"
            >
              ← Services
            </Link>
            <h1 className="mt-4 display text-[34px] text-white sm:text-5xl lg:text-6xl">{service.name}</h1>
          </div>
        </div>
      )}

      <div className="relative z-[2] mx-auto -mt-12 max-w-wrap space-y-10 px-6 pb-10 sm:-mt-14 lg:px-10">
        {service.description ? (
          <ServiceOverview
            name={service.name}
            description={service.description}
            platforms={service.platforms || []}
          />
        ) : null}

        {service.platforms?.length ? (
          <section className="space-y-6">
            <div>
              <div className="eyebrow">Platforms</div>
              <h2 className="display mt-3 text-[30px] text-navy-900 sm:text-4xl">
                Platforms &amp; <span className="gold-text">features</span>
              </h2>
            </div>
            {service.platforms.map((platform) => (
              <PlatformBlock key={platform.id} platform={platform} />
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
