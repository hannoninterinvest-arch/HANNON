import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { HannonService, ServicePlatform } from "@/lib/types";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import ServiceCard from "@/components/ServiceCard";
import ServiceOverview from "@/components/ServiceOverview";
import {
  SITE_NAME,
  breadcrumbJsonLd,
  pageMetadata,
  plainText,
  serviceJsonLd,
  socialImage,
  truncate,
} from "@/lib/seo";
import { getPublishedService, getPublishedServices } from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const service = await getPublishedService(params.slug);
  const full = `${service.name} | ${SITE_NAME}`;
  const title = full.length <= 65 ? full : `${truncate(service.name, 48)} | HANNON`;
  const base = plainText(service.description);
  const description = truncate(
    base.length >= 110
      ? base
      : `${base ? `${base} ` : ""}${service.name}: a service of ${SITE_NAME}, a Tunisia-based investment and project development company.`,
    160,
  );
  return pageMetadata({
    title,
    description,
    path: `/services/${service.slug}`,
    image: socialImage(service.imageUrl, service.name),
  });
}

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
            alt={platform.name || ""}
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
                alt={platform.name || ""}
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

export default async function ServiceDetailPage({ params }: Params) {
  const [service, all] = await Promise.all([getPublishedService(params.slug), getPublishedServices()]);
  const others = all.filter((item) => item.slug !== service.slug).slice(0, 3);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: service.name, href: `/services/${service.slug}` },
  ];

  return (
    <main id="main-content" className="bg-ivory pb-20">
      <JsonLd
        data={[
          serviceJsonLd(service),
          breadcrumbJsonLd(crumbs.map((crumb) => ({ name: crumb.name, path: crumb.href }))),
        ]}
      />
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
            <Breadcrumbs items={crumbs} className="mb-4" />
            <h1 className="display text-[34px] text-white sm:text-5xl lg:text-6xl">{service.name}</h1>
          </div>
        </div>
      ) : (
        <div className="bg-navy-900">
          <div className="mx-auto max-w-wrap px-6 pb-24 pt-16 lg:px-10">
            <Breadcrumbs items={crumbs} />
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

        <section aria-labelledby="more-services" className="pt-6">
          <div className="eyebrow">Explore HANNON</div>
          <h2 id="more-services" className="display mt-3 text-[28px] text-navy-900 sm:text-4xl">
            {others.length ? "Other services" : "Our investment projects"}
          </h2>
          {others.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((item, index) => (
                <ServiceCard key={item.id} service={item} index={index} />
              ))}
            </div>
          )}
          <p className="mt-6 text-[15px] font-light text-navy-800">
            <Link href="/services" className="text-gold-500 underline underline-offset-4">
              View all services
            </Link>
            {" · "}
            <Link href="/projects" className="text-gold-500 underline underline-offset-4">
              Browse investment projects
            </Link>
            {" · "}
            <Link href="/contact" className="text-gold-500 underline underline-offset-4">
              Contact HANNON
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
