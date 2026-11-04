import JsonLd from "@/components/JsonLd";
import PageHeader from "@/components/PageHeader";
import CtaBand from "@/components/CtaBand";
import AboutDetails from "@/components/AboutDetails";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About HANNON | International Investment Company in Tunisia",
  description: "HANNON International Investments identifies, structures and promotes strategic investment opportunities across sectors.",
  path: "/about",
});

const CRUMBS = [{ name: "Home", href: "/" }, { name: "About", href: "/about" }];

export default function AboutPage() {
  return <main id="main-content">
    <JsonLd data={breadcrumbJsonLd(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}/>
    <PageHeader eyebrow="About Us" crumbs={CRUMBS} title="HANNON International Investments" description="A Tunisia-based investment and project development company."/>
    <AboutDetails/>
    <CtaBand/>
  </main>;
}
