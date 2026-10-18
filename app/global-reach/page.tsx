import GlobalReach from "@/components/GlobalReach";
import CtaBand from "@/components/CtaBand";
import JsonLd from "@/components/JsonLd";
import PageHeader from "@/components/PageHeader";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Global Reach: Africa, Middle East, Europe & Asia | HANNON",
  description:
    "HANNON International Investments works from Tunisia with investors, industrial partners and institutions across Africa, the Middle East, Europe and Asia.",
  path: "/global-reach",
});

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Global Reach", href: "/global-reach" },
];

export default function GlobalReachPage() {
  return (
    <main id="main-content">
      <JsonLd data={breadcrumbJsonLd(CRUMBS.map((c) => ({ name: c.name, path: c.href })))} />
      <PageHeader
        eyebrow="Global Reach"
        crumbs={CRUMBS}
        title={
          <>
            HANNON across <span className="gold-text">continents</span>
          </>
        }
        description="Tunisia-based, working with partners in Africa, the Middle East, Europe and Asia."
      />
      <GlobalReach />
      <CtaBand />
    </main>
  );
}
