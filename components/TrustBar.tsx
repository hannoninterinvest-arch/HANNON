const TRUST_ITEMS = [
  {
    label: "Sovereign Institutions",
    icon: (
      <path d="M3 21h18M4 21V9l8-5 8 5v12M9 21v-6h6v6M6 21V11M18 21V11" />
    ),
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
    <div id="about" className="border-t border-white/[0.06] bg-navy-800 py-[26px]">
      <div className="mx-auto grid max-w-wrap grid-cols-2 items-center gap-5 px-10 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="text-[11px] font-semibold uppercase leading-relaxed tracking-[1.5px] text-gold-400">
          Trusted by Sovereign Institutions &amp; Global Partners
        </div>
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.8px] text-[#d7deea]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              className="h-[26px] w-[26px] flex-shrink-0 text-gold-500"
            >
              {item.icon}
            </svg>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
