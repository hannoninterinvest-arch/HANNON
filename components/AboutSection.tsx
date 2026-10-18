import Link from "next/link";
import { CONTACT, REGIONS, SECTORS, SITE_NAME } from "@/lib/seo";
import Reveal from "./Reveal";

export const ABOUT_PARAGRAPHS = [
  "HANNON International Investments is a Tunisia-based international investment and business development company focused on identifying, structuring and promoting strategic investment opportunities.",
  "The company connects investors, industrial partners, technology providers and entrepreneurs to develop projects in renewable energy, healthcare, agriculture, artificial intelligence, advanced technologies, international trade, industrial production and infrastructure.",
  "Through international cooperation, project development and strategic partnerships, HANNON aims to transform investment opportunities into sustainable industrial and commercial ventures across Tunisia, Africa, the Middle East and international markets.",
];

export const PILLARS = [
  { title: "Identify", text: "Strategic investment opportunities with industrial and commercial potential." },
  { title: "Structure", text: "Projects shaped with investors, industrial partners and technology providers." },
  { title: "Promote", text: "Opportunities presented to international partners and capital providers." },
];

export default function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-heading" className="relative scroll-mt-20 bg-ivory py-16 sm:py-24">
      <div className="section-pad mx-auto max-w-wrap">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.35fr_0.85fr] lg:gap-16">
          <Reveal>
            <div className="eyebrow">About Us</div>
            <h2 id="about-heading" className="display mt-4 text-[32px] uppercase text-navy-900 sm:text-[44px]">
              About <span className="gold-text">HANNON</span> International Investments
            </h2>
            <div className="mt-6 space-y-4 text-[15px] font-light leading-[1.9] text-navy-800 sm:text-base">
              {ABOUT_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <Link href="/about" className="btn btn-outline-navy mt-8 w-full sm:w-fit">
              Learn more about HANNON <span aria-hidden>→</span>
            </Link>
          </Reveal>

          <Reveal delay={120}>
            <aside className="card-shadow rounded-2xl bg-navy-900 p-6 text-white sm:p-8" aria-label="Company at a glance">
              <h3 className="text-[11px] font-semibold uppercase tracking-[2.5px] text-gold-400">At a glance</h3>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[1.5px] text-muted">Company</dt>
                  <dd className="mt-1 text-white/90">{SITE_NAME}</dd>
                </div>
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[1.5px] text-muted">Headquarters</dt>
                  <dd className="mt-1 text-white/90">
                    {CONTACT.streetAddress}, {CONTACT.locality} {CONTACT.postalCode}, {CONTACT.country}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[1.5px] text-muted">Markets</dt>
                  <dd className="mt-1 text-white/90">{REGIONS.join(", ")} and international markets</dd>
                </div>
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[1.5px] text-muted">Contact</dt>
                  <dd className="mt-1">
                    <a href={`mailto:${CONTACT.email}`} className="break-all text-white/90 hover:text-gold-400">
                      {CONTACT.email}
                    </a>
                    <br />
                    <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="text-white/90 hover:text-gold-400">
                      {CONTACT.phone}
                    </a>
                  </dd>
                </div>
              </dl>
            </aside>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 90} className="h-full">
              <div className="card-shadow h-full rounded-2xl bg-white p-6">
                <div className="font-serif text-4xl font-semibold text-gold-500/60">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-navy-900">{pillar.title}</h3>
                <p className="mt-2 text-[14px] font-light leading-relaxed text-muted-dark">{pillar.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12">
          <h3 className="text-[11px] font-semibold uppercase tracking-[2.5px] text-gold-500">Sectors of activity</h3>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {SECTORS.map((sector) => (
              <li
                key={sector}
                className="rounded-full border border-navy-800/15 bg-white px-4 py-2 text-[12px] font-medium text-navy-800"
              >
                {sector}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
