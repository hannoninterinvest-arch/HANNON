import JsonLd from "@/components/JsonLd";
import PageHeader from "@/components/PageHeader";
import ServiceCard from "@/components/ServiceCard";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getPublishedServices } from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Investment & Advisory Services | HANNON International",
  description:
    "Investment, project development and advisory services published by HANNON International Investments, a Tunisia-based company working with global investors.",
  path: "/services",
});

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
];

export default async function ServicesPage() {
  const services = await getPublishedServices();

  return (
    <main id="main-content">
      <JsonLd data={breadcrumbJsonLd(CRUMBS.map((c) => ({ name: c.name, path: c.href })))} />
      <PageHeader
        eyebrow="Services"
        crumbs={CRUMBS}
        title={
          <>
            Services <span className="gold-text">HANNON</span>
          </>
        }
        description="Discover the activities published by HANNON International Investments. Each card opens the service page."
      />
      <div className="bg-ivory py-12 sm:py-16">
        <div className="section-pad mx-auto max-w-wrap">
          {services.length === 0 && (
            <p className="rounded-2xl border border-dashed border-gold-500/40 bg-white px-6 py-10 text-center text-sm text-muted-dark">
              No published services yet.
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
