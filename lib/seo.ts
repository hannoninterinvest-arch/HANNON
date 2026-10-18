import type { Metadata } from "next";

export const SITE_URL = "https://hannoninterinvest.com";
export const SITE_NAME = "HANNON International Investments";
export const LEGAL_NAME = "HANNON INTERNATIONAL INVESTMENTS";
export const SHORT_NAME = "HANNON";
export const TAGLINE = "Structuring Sovereign Capital. Delivering Global Impact.";

export const HOME_TITLE = "HANNON International Investments | Investment & Global Projects";
export const HOME_DESCRIPTION =
  "HANNON International Investments is a Tunisia-based international investment and project development company connecting investors, industrial partners and innovative businesses across global markets.";

export const CONTACT = {
  email: "contact@hannoninterinvest.com",
  phone: "+216 56 147 900",
  streetAddress: "Immeuble Saadi, Tour EF, Menzah 4",
  locality: "Tunis",
  postalCode: "1082",
  country: "Tunisia",
  countryCode: "TN",
} as const;

export const SECTORS = [
  "Renewable energy",
  "Healthcare",
  "Agriculture",
  "Artificial intelligence",
  "Advanced technologies",
  "International trade",
  "Industrial production",
  "Infrastructure",
] as const;

export const REGIONS = ["Tunisia", "Africa", "Middle East", "Europe", "Asia"] as const;

export const OG_IMAGE = {
  url: `${SITE_URL}/og-image.jpg`,
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} - ${TAGLINE}`,
};

// Only the production deployment is allowed to be indexed. Previews and staging stay out of search.
export const INDEXABLE = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true;

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export function plainText(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/[*_`#>]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(value: string | null | undefined, max: number) {
  const text = plainText(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-]+$/, "")}…`;
}

// Cloudinary images are cropped to the 1200x630 social preview ratio. Other hosts are used as is.
export function socialImage(url: string | null | undefined, alt: string) {
  if (!url) return OG_IMAGE;
  const marker = "/image/upload/";
  if (url.includes("res.cloudinary.com") && url.includes(marker) && !url.includes("c_fill")) {
    return {
      url: url.replace(marker, `${marker}c_fill,g_auto,w_1200,h_630,q_auto,f_jpg/`),
      width: 1200,
      height: 630,
      alt,
    };
  }
  return { url, width: 1200, height: 630, alt };
}

type PageMeta = {
  title: string;
  description: string;
  path: string;
  image?: typeof OG_IMAGE;
  type?: "website" | "article";
  noindex?: boolean;
};

// Complete, per-page metadata. Child openGraph/twitter objects replace the parent ones in Next.js,
// so every page declares the full set here instead of relying on inheritance.
export function pageMetadata({ title, description, path, image = OG_IMAGE, type = "website", noindex }: PageMeta): Metadata {
  const url = absoluteUrl(path);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export const privateMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

type Crumb = { name: string; path: string };

export const organizationId = `${SITE_URL}/#organization`;
export const websiteId = `${SITE_URL}/#website`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: LEGAL_NAME,
    alternateName: [SHORT_NAME, SITE_NAME],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon-512.png`,
      width: 512,
      height: 512,
    },
    image: OG_IMAGE.url,
    description: HOME_DESCRIPTION,
    email: CONTACT.email,
    telephone: CONTACT.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.streetAddress,
      addressLocality: CONTACT.locality,
      postalCode: CONTACT.postalCode,
      addressCountry: CONTACT.countryCode,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: CONTACT.email,
        telephone: CONTACT.phone,
        availableLanguage: ["English"],
      },
    ],
    areaServed: ["Tunisia", "Africa", "Middle East", "Europe", "Asia"],
    slogan: TAGLINE,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: [SHORT_NAME, LEGAL_NAME],
    inLanguage: "en",
    publisher: { "@id": organizationId },
  };
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function serviceJsonLd(service: { name: string; slug: string; description?: string | null; imageUrl?: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(`/services/${service.slug}`)}#service`,
    name: service.name,
    url: absoluteUrl(`/services/${service.slug}`),
    description: truncate(service.description, 300) || undefined,
    image: service.imageUrl || undefined,
    provider: { "@id": organizationId },
  };
}

export function projectJsonLd(project: {
  id: string;
  title: string;
  summary?: string | null;
  description?: string | null;
  sector?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  updatedAt?: string | Date | null;
}) {
  const url = absoluteUrl(`/projects/${project.id}`);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: project.title,
    description: truncate(project.summary || project.description, 300) || undefined,
    image: project.imageUrl || undefined,
    inLanguage: "en",
    isPartOf: { "@id": websiteId },
    publisher: { "@id": organizationId },
    about: project.sector ? { "@type": "Thing", name: project.sector } : undefined,
    contentLocation: project.location ? { "@type": "Place", name: project.location } : undefined,
    dateModified: project.updatedAt ? new Date(project.updatedAt).toISOString() : undefined,
  };
}
