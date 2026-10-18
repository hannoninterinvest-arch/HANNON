import JsonLd from "@/components/JsonLd";
import PageHeader from "@/components/PageHeader";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getVisibleProjects } from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Investment Projects & Opportunities | HANNON Tunisia",
  description:
    "Investment projects originated and structured by HANNON International Investments in energy, healthcare, agriculture, technology, trade and infrastructure.",
  path: "/projects",
});

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
];

export default async function ProjectsPage() {
  const projects = await getVisibleProjects();

  return (
    <main id="main-content">
      <JsonLd data={breadcrumbJsonLd(CRUMBS.map((c) => ({ name: c.name, path: c.href })))} />
      <PageHeader
        eyebrow="Mandates"
        crumbs={CRUMBS}
        title={
          <>
            Investment <span className="gold-text">projects</span>
          </>
        }
        description="Explore live opportunities originated and structured by HANNON."
      />
      <div className="bg-ivory py-12 sm:py-16">
        <div className="section-pad mx-auto max-w-wrap">
          {projects.length === 0 && (
            <p className="rounded-2xl border border-dashed border-gold-500/40 bg-white px-6 py-10 text-center text-sm text-muted-dark">
              Investment projects will be published here.
            </p>
          )}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {projects.map((project, i) => (
              <Reveal key={project.id} delay={(i % 3) * 90} className="h-full">
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
