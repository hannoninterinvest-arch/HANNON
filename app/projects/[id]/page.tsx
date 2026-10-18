import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { money, pct, progressOf } from "@/lib/api";
import type { RiskLevel } from "@/lib/types";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import ProjectCard from "@/components/ProjectCard";
import ProjectCharts from "@/components/ProjectCharts";
import TicketCalculator from "@/components/TicketCalculator";
import { driveLinks } from "@/lib/drive";
import {
  SITE_NAME,
  breadcrumbJsonLd,
  pageMetadata,
  plainText,
  projectJsonLd,
  socialImage,
  truncate,
} from "@/lib/seo";
import { getPublicProject, getPublishedServices, getVisibleProjects } from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = await getPublicProject(params.id);
  const sector = plainText(project.sector);
  const candidates = [
    `${project.title} | ${sector} Investment Project | HANNON`,
    `${project.title} | ${sector} Project | HANNON`,
    `${project.title} | HANNON Projects`,
  ];
  const title = candidates.find((t) => t.length <= 65) ?? `${truncate(project.title, 48)} | HANNON`;
  const intro = plainText(project.summary || project.description);
  const description = truncate(
    intro.length >= 110
      ? intro
      : `${intro ? `${intro} ` : ""}${sector} investment project in ${plainText(project.location)} presented by ${SITE_NAME}.`,
    160,
  );
  return pageMetadata({
    title,
    description,
    path: `/projects/${project.id}`,
    image: socialImage(project.imageUrl, project.title),
  });
}

const RISK: Record<RiskLevel, { label: string; className: string; bars: number }> = {
  low: { label: "Low risk", className: "bg-[#e5f2ea] text-[#1f6b3a]", bars: 1 },
  medium: { label: "Medium risk", className: "bg-[#fbf0d8] text-[#8a6416]", bars: 2 },
  high: { label: "High risk", className: "bg-[#f8e4e4] text-[#8a2a2a]", bars: 3 },
};

const STATUS: Record<string, string> = { open: "Open for investment", funded: "Fully funded", closed: "Closed" };

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 pt-14">
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="mb-6 mt-2 font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">{title}</h2>
      {children}
    </section>
  );
}

export default async function ProjectDetailPage({ params }: Params) {
  const project = await getPublicProject(params.id);
  const [allProjects, allServices] = await Promise.all([getVisibleProjects(), getPublishedServices()]);
  const related = [
    ...allProjects.filter((p) => p.id !== project.id && p.sector === project.sector),
    ...allProjects.filter((p) => p.id !== project.id && p.sector !== project.sector),
  ].slice(0, 3);
  const relatedServices = allServices.slice(0, 4);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/projects" },
    { name: project.title, href: `/projects/${project.id}` },
  ];

  const progress = progressOf(project.raisedAmount, project.targetAmount);
  const remaining = Math.max(0, Number(project.targetAmount) - Number(project.raisedAmount));
  const presentation = driveLinks(project.presentationUrl);
  const interestHref = `/contact?type=interest&project=${project.id}`;
  const risk = project.riskLevel ? RISK[project.riskLevel] : null;
  const tiers = project.ticketTiers || [];
  const milestones = project.milestones || [];
  const risks = project.risks || [];
  const annual = Number(project.expectedReturn) / 100;
  const months = Math.max(1, Number(project.durationMonths) || 12);
  const maxTicket = Number(project.maxInvestment) > 0 ? Number(project.maxInvestment) : null;
  const closing = formatDate(project.closingDate);
  const hasAnalytics =
    (project.stats?.length || 0) > 0 ||
    project.useOfProceeds?.length > 0 ||
    project.capitalStructure?.length > 0 ||
    tiers.length > 0;

  const kpis = [
    ["Target", money(project.targetAmount)],
    ["Raised", money(project.raisedAmount)],
    ["Remaining", money(remaining)],
    ["Expected return", pct(project.expectedReturn)],
    ["Horizon", `${project.durationMonths} months`],
    ["Minimum ticket", money(project.minInvestment)],
  ];

  const terms: [string, string | null][] = [
    ["Instrument", project.instrument],
    ["Expected return", `${pct(project.expectedReturn)} a year`],
    ["Investment horizon", `${project.durationMonths} months`],
    ["Payout frequency", project.payoutFrequency],
    ["Closing date", closing],
    ["Minimum ticket", money(project.minInvestment)],
    ["Maximum ticket", maxTicket ? money(maxTicket) : null],
    ["Ticket increment", Number(project.ticketStep) > 0 ? money(Number(project.ticketStep)) : null],
    ["Sector", project.sector],
    ["Location", project.location],
  ];
  const visibleTerms = terms.filter((t): t is [string, string] => Boolean(t[1]));

  const nav = [
    ["overview", "Overview", true],
    ["terms", "Deal terms", true],
    ["ticket", "Ticket", true],
    ["presentation", "Presentation", Boolean(presentation)],
    ["analytics", "Analytics", hasAnalytics],
    ["timeline", "Timeline", milestones.length > 0],
    ["risks", "Risks & exit", risks.length > 0 || Boolean(project.exitStrategy) || Boolean(project.securityGuarantees)],
    ["interest", "Invest", true],
  ].filter((n) => n[2]) as [string, string, boolean][];

  return (
    <main id="main-content" className="bg-ivory pb-20">
      <JsonLd
        data={[
          projectJsonLd(project),
          breadcrumbJsonLd(crumbs.map((crumb) => ({ name: crumb.name, path: crumb.href }))),
        ]}
      />
      <div className="relative h-[340px] w-full overflow-hidden bg-navy-900 sm:h-[440px]">
        {project.imageUrl && (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/70 to-navy-900/25 sm:bg-gradient-to-r sm:via-navy-900/75 sm:to-navy-900/20" />
        <div className="section-pad relative z-[1] mx-auto flex h-full max-w-wrap flex-col justify-end pb-12">
          <Breadcrumbs items={crumbs} className="mb-4" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gold-500 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[1.5px] text-navy-900">
              {STATUS[project.status] || project.status}
            </span>
            {risk && (
              <span className={`rounded-full px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[1.5px] ${risk.className}`}>
                {risk.label}
              </span>
            )}
            <span className="rounded-full border border-white/30 px-3 py-1 text-[10.5px] uppercase tracking-[1.5px] text-white/90">
              {project.sector}
            </span>
            <span className="rounded-full border border-white/30 px-3 py-1 text-[10.5px] uppercase tracking-[1.5px] text-white/90">
              {project.location}
            </span>
          </div>
          <h1 className="display mt-3 text-[34px] text-white sm:text-5xl lg:text-6xl">{project.title}</h1>
          {project.summary && (
            <p className="mt-3 max-w-2xl text-[15px] font-light leading-relaxed text-white/80">
              {project.summary}
            </p>
          )}
        </div>
      </div>

      <div className="section-pad mx-auto max-w-wrap">
        <div className="relative z-[2] -mt-8 grid grid-cols-2 gap-3 sm:-mt-10 sm:grid-cols-3 lg:grid-cols-6">
          {kpis.map(([label, value]) => (
            <div key={label} className="card-shadow rounded-2xl bg-white px-4 py-4 sm:px-5">
              <div className="text-[10px] font-medium uppercase tracking-[1.5px] text-muted-dark">{label}</div>
              <div className="mt-1.5 font-serif text-[22px] font-semibold leading-tight text-navy-900 sm:text-2xl">
                {value}
              </div>
            </div>
          ))}
        </div>

        <nav
          aria-label="Project sections"
          className="sticky top-16 z-20 -mx-5 mt-6 border-b border-[#e8e2d4] bg-ivory/90 px-5 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-3"
        >
          <ul className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
            {nav.map(([id, label]) => (
              <li key={id} className="shrink-0">
                <a
                  href={`#${id}`}
                  className="block rounded-full px-4 py-2 text-[12px] font-medium uppercase tracking-[1.5px] text-navy-800 transition-colors hover:bg-gold-500/15 hover:text-gold-500"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_0.8fr]">
          <div className="min-w-0">
            <Section id="overview" eyebrow="The mandate" title="Overview">
              <div className="card-shadow rounded-2xl bg-white p-6 sm:p-8">
                <p className="whitespace-pre-line text-[15px] font-light leading-[1.85] text-navy-800">
                  {project.description}
                </p>
                {project.highlights?.length ? (
                  <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {project.highlights.map((item) => (
                      <li
                        key={item}
                        className="rounded-xl border border-[#efebe3] bg-ivory px-3 py-3 text-[12.5px] text-navy-800"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Section>

            <Section id="terms" eyebrow="At a glance" title="Deal terms">
              <dl className="card-shadow grid grid-cols-1 overflow-hidden rounded-2xl bg-white sm:grid-cols-2">
                {visibleTerms.map(([label, value], i) => (
                  <div
                    key={label}
                    className={`flex items-baseline justify-between gap-4 border-[#efebe3] px-5 py-4 sm:px-6 ${
                      i % 2 === 0 ? "sm:border-r" : ""
                    } ${i < visibleTerms.length - (visibleTerms.length % 2 === 0 ? 2 : 1) ? "border-b" : ""}`}
                  >
                    <dt className="text-[11px] font-medium uppercase tracking-[1.5px] text-muted-dark">{label}</dt>
                    <dd className="text-right text-[14.5px] font-medium text-navy-900">{value}</dd>
                  </div>
                ))}
              </dl>
              {project.securityGuarantees && (
                <div className="mt-4 rounded-2xl border border-gold-500/30 bg-gold-500/[0.07] px-5 py-4">
                  <div className="text-[10.5px] font-semibold uppercase tracking-[2px] text-gold-500">
                    Security and guarantees
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-[14px] font-light leading-relaxed text-navy-800">
                    {project.securityGuarantees}
                  </p>
                </div>
              )}
            </Section>

            <Section id="ticket" eyebrow="Your investment" title="Ticket details">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  ["Minimum", money(project.minInvestment)],
                  ["Maximum", maxTicket ? money(maxTicket) : "On request"],
                  ["Increment", Number(project.ticketStep) > 0 ? money(Number(project.ticketStep)) : "Flexible"],
                ].map(([label, value]) => (
                  <div key={label} className="card-shadow rounded-2xl bg-white px-3 py-4 sm:px-5">
                    <div className="text-[10px] font-medium uppercase tracking-[1.5px] text-muted-dark">{label}</div>
                    <div className="mt-1 font-serif text-lg sm:text-2xl font-semibold text-navy-900">{value}</div>
                  </div>
                ))}
              </div>

              {tiers.length > 0 && (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {tiers.map((tier) => {
                    const amount = Number(tier.amount);
                    const gain = amount * annual * (months / 12);
                    const href = `${interestHref}&budget=${Math.round(amount)}&ticket=${encodeURIComponent(tier.label)}`;
                    return (
                      <div key={tier.label} className="card-shadow flex flex-col rounded-2xl bg-white p-5">
                        <div className="text-[11px] font-semibold uppercase tracking-[2px] text-gold-500">
                          {tier.label}
                        </div>
                        <div className="mt-2 font-serif text-3xl font-semibold text-navy-900">{money(amount)}</div>
                        {tier.note && (
                          <p className="mt-2 text-[13px] font-light leading-relaxed text-muted-dark">{tier.note}</p>
                        )}
                        <div className="mt-4 flex items-center justify-between rounded-xl bg-ivory px-3 py-2.5 text-[12.5px]">
                          <span className="text-muted-dark">Projected at maturity</span>
                          <span className="font-semibold text-navy-900">{money(Math.round(amount + gain))}</span>
                        </div>
                        <Link href={href} className="btn btn-outline-navy mt-4 w-full">
                          Choose this tier
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5">
                <TicketCalculator project={project} />
              </div>
            </Section>

            {presentation && (
              <Section id="presentation" eyebrow="Documents" title="Project presentation">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                  {presentation.downloadUrl && (
                    <a
                      href={presentation.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-gold"
                    >
                      Download PDF
                    </a>
                  )}
                  <a
                    href={presentation.viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-navy"
                  >
                    Open in Google Drive
                  </a>
                </div>
                {presentation.previewUrl ? (
                  <div className="card-shadow overflow-hidden rounded-2xl bg-white">
                    <iframe
                      src={presentation.previewUrl}
                      title={`${project.title} presentation`}
                      loading="lazy"
                      allow="autoplay"
                      className="h-[460px] w-full sm:h-[640px]"
                    />
                  </div>
                ) : (
                  <p className="card-shadow rounded-2xl bg-white p-6 text-sm text-muted-dark">
                    This presentation is a Drive folder. Use “Open in Google Drive” to browse it.
                  </p>
                )}
              </Section>
            )}

            {hasAnalytics && (
              <Section id="analytics" eyebrow="Data room" title="Analytics and allocation">
                <ProjectCharts project={project} />
              </Section>
            )}

            {milestones.length > 0 && (
              <Section id="timeline" eyebrow="Roadmap" title="Project timeline">
                <ol className="card-shadow relative rounded-2xl bg-white p-6 sm:p-8">
                  {milestones.map((m, i) => {
                    const tone =
                      m.status === "done"
                        ? "bg-gold-500 border-gold-500 text-navy-900"
                        : m.status === "active"
                          ? "bg-white border-gold-500 text-gold-500 ring-4 ring-gold-500/20"
                          : "bg-white border-[#d9d3c4] text-muted-dark";
                    return (
                      <li key={`${m.label}-${i}`} className="relative flex gap-4 pb-7 last:pb-0">
                        {i < milestones.length - 1 && (
                          <span className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-[#e4dfd4]" />
                        )}
                        <span
                          className={`relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-semibold ${tone}`}
                        >
                          {m.status === "done" ? "✓" : i + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[15px] font-medium text-navy-900">{m.label}</div>
                          <div className="mt-0.5 text-[12px] uppercase tracking-[1.5px] text-muted-dark">
                            {m.date || "Date to be confirmed"}
                            {" · "}
                            {m.status === "done" ? "Completed" : m.status === "active" ? "In progress" : "Upcoming"}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </Section>
            )}

            {(risks.length > 0 || project.exitStrategy || project.securityGuarantees) && (
              <Section id="risks" eyebrow="Due diligence" title="Risks and exit">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {risks.length > 0 && (
                    <div className="card-shadow rounded-2xl bg-white p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-semibold uppercase tracking-[2px] text-navy-800">
                          Key risks
                        </h3>
                        {risk && (
                          <span className="flex items-center gap-1" title={risk.label}>
                            {[1, 2, 3].map((n) => (
                              <span
                                key={n}
                                className={`h-2 w-5 rounded-full ${n <= risk.bars ? "bg-gold-500" : "bg-[#e8e2d4]"}`}
                              />
                            ))}
                          </span>
                        )}
                      </div>
                      <ul className="mt-4 space-y-3">
                        {risks.map((r) => (
                          <li key={r} className="flex gap-3 text-[14px] font-light leading-relaxed text-navy-800">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.exitStrategy && (
                    <div className="card-shadow rounded-2xl bg-white p-6">
                      <h3 className="text-[11px] font-semibold uppercase tracking-[2px] text-navy-800">
                        Exit strategy
                      </h3>
                      <p className="mt-4 whitespace-pre-line text-[14px] font-light leading-relaxed text-navy-800">
                        {project.exitStrategy}
                      </p>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-[12px] font-light text-muted-dark">
                  Investing involves risk, including loss of capital. Past or projected performance is not a
                  guarantee of future results.
                </p>
              </Section>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-40 lg:mt-14 lg:self-start" id="interest">
            <div className="card-shadow rounded-2xl bg-white p-6">
              <div className="text-[11px] uppercase tracking-[1.5px] text-muted-dark">Funding progress</div>
              <div className="mt-2 font-serif text-4xl font-semibold text-navy-900">{progress}%</div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#efebe3]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-muted-dark">
                {money(project.raisedAmount)} raised of {money(project.targetAmount)}
              </p>
              {closing && (
                <p className="mt-2 text-[12px] uppercase tracking-[1.5px] text-gold-500">Closes {closing}</p>
              )}
            </div>

            <div className="card-shadow rounded-2xl bg-navy-900 p-6 text-white">
              <h3 className="font-serif text-2xl font-semibold">Interested in this project?</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-muted">
                Send your contact details, ticket value and investor profile. A message and supporting files
                about your activities are optional. No account is needed.
              </p>
              <Link href={interestHref} className="btn btn-gold mt-5 w-full">
                Express your interest
              </Link>
              {presentation?.downloadUrl && (
                <a
                  href={presentation.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline mt-3 w-full"
                >
                  Download presentation
                </a>
              )}
            </div>
          </aside>
        </div>

        {(related.length > 0 || relatedServices.length > 0) && (
          <section aria-labelledby="related-heading" className="pt-16">
            <div className="eyebrow">Keep exploring</div>
            <h2 id="related-heading" className="mb-6 mt-2 font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
              {related.length > 0 ? "Related investment projects" : "HANNON services"}
            </h2>
            {related.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {related.map((item) => (
                  <ProjectCard key={item.id} project={item} />
                ))}
              </div>
            )}
            <p className="mt-8 text-[15px] font-light leading-relaxed text-navy-800">
              <Link href="/projects" className="text-gold-500 underline underline-offset-4">
                All investment projects
              </Link>
              {relatedServices.map((service) => (
                <span key={service.id}>
                  {" · "}
                  <Link href={`/services/${service.slug}`} className="text-gold-500 underline underline-offset-4">
                    {service.name}
                  </Link>
                </span>
              ))}
              {" · "}
              <Link href="/about" className="text-gold-500 underline underline-offset-4">
                About HANNON
              </Link>
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
