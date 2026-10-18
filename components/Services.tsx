import Link from "next/link";
import type { HannonService } from "@/lib/types";
import { HOME_SERVICES, pickHome } from "@/lib/home";
import Reveal from "./Reveal";
import ServiceCard from "./ServiceCard";

export default function Services({ services }: { services: HannonService[] }) {
  return (
    <section id="services" className="relative bg-white py-16 sm:py-24">
      <div className="section-pad mx-auto max-w-wrap">
        <Reveal className="mb-10 grid grid-cols-1 items-end gap-5 sm:mb-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <div className="eyebrow">Our Services</div>
            <h2 className="display mt-4 text-[34px] uppercase text-navy-900 sm:text-[46px]">
              Strategic Solutions.
              <br />
              <span className="gold-text">Global Execution.</span>
            </h2>
          </div>
          <p className="text-[15px] font-light leading-[1.85] text-muted-dark">
            We provide end-to-end financial advisory services tailored to the most complex and
            high-impact transactions, connecting sovereign clients with the capital and
            partnerships they need to deliver lasting impact.
          </p>
        </Reveal>

        {services.length === 0 && (
          <p className="rounded-2xl border border-dashed border-gold-500/40 bg-ivory px-6 py-10 text-center text-sm font-light text-muted-dark">
            Published services will appear here.
          </p>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
          {pickHome(services, HOME_SERVICES).map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>

        {services.length > 0 && (
          <div className="mt-10 text-center">
            <Link href="/services" className="btn btn-outline-navy w-full sm:w-fit">
              View all {services.length} service{services.length > 1 ? "s" : ""} <span aria-hidden>→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
