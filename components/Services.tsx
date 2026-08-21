"use client";

import { useEffect, useRef, useState } from "react";

const SERVICES = [
  {
    title: "Sovereign Financing Advisory",
    desc: "Advising governments on structuring and securing international funding solutions.",
    icon: <path d="M4 21h16M5 21V10l7-6 7 6v11M9 21v-6h6v6M6 10h12" />,
  },
  {
    title: "Capital Raising",
    desc: "Arranging debt and equity financing with global institutional investors, banks, and sovereign funds.",
    icon: <path d="M4 19V9m6 10V5m6 14v-7M2 19h20" />,
  },
  {
    title: "Project & Infrastructure Finance",
    desc: "Structuring and arranging financing for large-scale projects across key sectors and geographies.",
    icon: <path d="M4 12h4l3-8 4 16 3-8h4" />,
  },
  {
    title: "Public-Private Partnerships (PPP)",
    desc: "Design and execution of PPP frameworks that deliver sustainable value and long-term impact.",
    icon: (
      <>
        <circle cx="8" cy="8" r="3.5" />
        <circle cx="16" cy="16" r="3.5" />
        <path d="M4 20c0-2.8 1.8-5 4-5M20 4c0 2.8-1.8 5-4 5" />
      </>
    ),
  },
  {
    title: "Strategic Financial Structuring",
    desc: "Engineering complex financial solutions tailored to institutional needs and strategic objectives.",
    icon: (
      <>
        <circle cx="9" cy="12" r="5.5" />
        <circle cx="15" cy="12" r="5.5" />
      </>
    ),
  },
  {
    title: "Access to International Financial Institutions",
    desc: "Connecting clients to multilateral development banks, export credit agencies, and global lenders.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 4 5.7 4 9s-1.5 6.4-4 9c-2.5-2.6-4-5.7-4-9s1.5-6.4 4-9z" />
      </>
    ),
  },
];

/** Lightweight scroll-reveal hook — no external deps */
function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function ServiceCard({
  service,
  index,
}: {
  service: (typeof SERVICES)[number];
  index: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? `${index * 90}ms` : "0ms" }}
      className={`card-shadow card-shadow-hover group relative overflow-hidden rounded-[6px] bg-white px-6 py-[22px] transition-all duration-700 ease-out
        ${inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        hover:bg-[#faf8f3]`}
    >
      {/* Gold accent bar — grows on hover */}
      <span
        className="absolute left-0 top-0 h-full w-[3px] scale-y-0 bg-gold-500 transition-transform
          duration-300 ease-out group-hover:scale-y-100"
      />

      <div
        className="mb-3 flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#faf3e4]
          transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-gold-500"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          className="h-[18px] w-[18px] text-gold-500 transition-all duration-300 ease-out
            group-hover:rotate-[8deg] group-hover:text-white"
        >
          {service.icon}
        </svg>
      </div>

      <h3 className="mb-1.5 text-[12.5px] font-bold uppercase tracking-[1px] text-navy-900">
        {service.title}
      </h3>
      <p className="text-[13px] font-light leading-[1.5] text-muted-dark">
        {service.desc}
      </p>

      {/* Underline reveal on hover */}
      <span className="mt-2 block h-px w-0 bg-gold-500/60 transition-all duration-500 ease-out group-hover:w-8" />
    </div>
  );
}

export default function Services() {
  const { ref: headRef, inView: headInView } = useInView<HTMLDivElement>(0.3);

  return (
    <section id="services" className="bg-white py-10">
      <div className="mx-auto max-w-wrap px-10">
        <div
          ref={headRef}
          className={`mb-6 grid grid-cols-1 items-end gap-[40px] transition-all duration-700 ease-out lg:grid-cols-[1fr_1.4fr]
            ${headInView ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
        >
          <div>
            <div className="eyebrow">Our Services</div>
            <h2 className="mt-2 text-[26px] font-bold uppercase leading-tight text-navy-900 sm:text-[30px]">
              Strategic Solutions.
              <br />
              <span className="text-gold-500">Global Execution.</span>
            </h2>
          </div>
          <p className="text-[13.5px] font-light leading-[1.65] text-muted-dark">
            We provide end-to-end financial advisory services tailored to the
            most complex and high-impact transactions, connecting sovereign
            clients with the capital and partnerships they need to deliver
            lasting impact.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}