import Reveal from "./Reveal";

const TRUST_ITEMS = [
  {
    label: "Sovereign Institutions",
    icon: <path d="M3 21h18M4 21V9l8-5 8 5v12M9 21v-6h6v6M6 21V11M18 21V11" />,
  },
  {
    label: "Strategic Partners",
    icon: (
      <>
        <path d="M8 12h.01M2 12l4-2 3 2 3-4 3 3 4-2 3 3" />
        <path d="M11 15c1 1 3 1 4 0M9 13l-3 3 3 3M15 13l3 3-3 3" />
      </>
    ),
  },
  {
    label: "Global Investors",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 4 5.7 4 9s-1.5 6.4-4 9c-2.5-2.6-4-5.7-4-9s1.5-6.4 4-9z" />
      </>
    ),
  },
  {
    label: "International Financial Institutions",
    icon: <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" />,
  },
];

export default function TrustBar() {
  return (
    <div id="about" className="relative border-b border-white/[0.06] bg-navy-800">
      <div className="section-pad mx-auto max-w-wrap py-9 sm:py-10">
        <Reveal>
          <div className="mb-7 flex items-center gap-4 lg:hidden">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-500/50" />
            <span className="text-center text-[10.5px] font-semibold uppercase tracking-[2px] text-gold-400">
              Trusted by Sovereign Institutions &amp; Global Partners
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-500/50" />
          </div>
          <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2 lg:grid-cols-[1.25fr_repeat(4,1fr)] lg:gap-6">
            <div className="hidden text-[11px] font-semibold uppercase leading-relaxed tracking-[2px] text-gold-400 lg:block">
              Trusted by Sovereign Institutions &amp; Global Partners
            </div>
            {TRUST_ITEMS.map((item) => (
              <div
                key={item.label}
                className="group flex items-center gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-[11px] font-medium uppercase leading-snug tracking-[1px] text-[#d7deea] transition-all duration-300 hover:border-gold-500/40 hover:bg-white/[0.06] lg:border-transparent lg:bg-transparent lg:px-0"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-500/30 text-gold-400 transition-all duration-300 group-hover:border-gold-500 group-hover:bg-gold-500 group-hover:text-navy-900">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[22px] w-[22px]"
                  >
                    {item.icon}
                  </svg>
                </span>
                {item.label}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
