import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PageHeader from "@/components/PageHeader";
import CtaBand from "@/components/CtaBand";
import { ABOUT_PARAGRAPHS, PILLARS } from "@/components/AboutSection";
import { SECTORS, REGIONS, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About HANNON | International Investment Company in Tunisia",
  description:
    "HANNON International Investments identifies, structures and promotes strategic investment opportunities in energy, healthcare, agriculture, AI and trade.",
  path: "/about",
});

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
];

export default function AboutPage() {
  return (
    <main id="main-content">
      <JsonLd data={breadcrumbJsonLd(CRUMBS.map((c) => ({ name: c.name, path: c.href })))} />
      <PageHeader
        eyebrow="About Us"
        crumbs={CRUMBS}
        title={
          <>
            About <span className="gold-text">HANNON</span> International Investments
          </>
        }
        description="A Tunisia-based international investment and business development company."
      />

      <div className="bg-ivory py-14 sm:py-20">
        <div className="section-pad mx-auto max-w-wrap">
          <section aria-labelledby="who-heading" className="max-w-3xl">
            <h2 id="who-heading" className="font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
              Who we are
            </h2>
            <div className="mt-5 space-y-4 text-[15px] font-light leading-[1.9] text-navy-800 sm:text-base">
              {ABOUT_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section aria-labelledby="what-heading" className="mt-14">
            <h2 id="what-heading" className="font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
              What we do
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {PILLARS.map((pillar, index) => (
                <div key={pillar.title} className="card-shadow rounded-2xl bg-white p-6">
                  <div className="font-serif text-4xl font-semibold text-gold-500/60">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-2 font-serif text-2xl font-semibold text-navy-900">{pillar.title}</h3>
                  <p className="mt-2 text-[14px] font-light leading-relaxed text-muted-dark">{pillar.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="sectors-heading" className="mt-14">
            <h2 id="sectors-heading" className="font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
              Sectors of activity
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SECTORS.map((sector) => (
                <li
                  key={sector}
                  className="card-shadow rounded-2xl bg-white px-4 py-5 text-center font-serif text-lg font-semibold text-navy-900"
                >
                  {sector}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="where-heading" className="mt-14 max-w-3xl">
            <h2 id="where-heading" className="font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
              Where we operate
            </h2>
            <p className="mt-5 text-[15px] font-light leading-[1.9] text-navy-800 sm:text-base">
              From Tunis, HANNON works with partners across {REGIONS.join(", ")} and international markets.
              Discover our <Link href="/global-reach" className="text-gold-500 underline underline-offset-4">global reach</Link>,
              the <Link href="/services" className="text-gold-500 underline underline-offset-4">services we publish</Link> and
              our current <Link href="/projects" className="text-gold-500 underline underline-offset-4">investment projects</Link>.
            </p>
          </section>
        </div>
      </div>
      <CtaBand />
    </main>
  );
}
