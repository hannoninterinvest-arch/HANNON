import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import AboutSection from "@/components/AboutSection";
import Services from "@/components/Services";
import ProjectsSection from "@/components/ProjectsSection";
import GlobalReach from "@/components/GlobalReach";
import CtaBand from "@/components/CtaBand";
import JsonLd from "@/components/JsonLd";
import { HOME_DESCRIPTION, HOME_TITLE, organizationJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import { getPublishedServices, getVisibleProjects } from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({ title: HOME_TITLE, description: HOME_DESCRIPTION, path: "/" });

export default async function Home() {
  const [services, projects] = await Promise.all([getPublishedServices(), getVisibleProjects()]);

  return (
    <main id="main-content">
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <Hero />
      <TrustBar />
      <AboutSection />
      <Services services={services} />
      <ProjectsSection projects={projects} />
      <GlobalReach />
      <CtaBand />
    </main>
  );
}
