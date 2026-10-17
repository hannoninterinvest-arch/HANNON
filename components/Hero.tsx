import Image from "next/image";
import Link from "next/link";

const PILLARS = [
  {
    title: "Sovereign Financing",
    text: "Funding strategies for governments and institutions.",
    icon: <path d="M3 21h18M4 21V9l8-5 8 5v12M9 21v-6h6v6M6 21V11M18 21V11" />,
  },
  {
    title: "Capital Structuring",
    text: "Robust structures for complex, high-impact transactions.",
    icon: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  },
  {
    title: "International Funding",
    text: "Access to global investors and financial institutions.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 4 5.7 4 9s-1.5 6.4-4 9c-2.5-2.6-4-5.7-4-9s1.5-6.4 4-9z" />
      </>
    ),
  },
];

export default function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden bg-navy-900 text-white">
      <Image
        src="https://res.cloudinary.com/dbzweuzla/image/upload/v1786386096/630292ea-2558-499a-b414-3180fabd058b.jfif_2K_202608101920_asse86.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-30 object-cover object-[70%_center]"
      />

      <div
        className="pointer-events-none absolute inset-0 -z-20 lg:opacity-60"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,13,26,0.55) 0%, rgba(5,13,26,0.82) 60%, #050d1a 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-20 hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg, #050d1a 0%, rgba(5,13,26,0.9) 30%, rgba(5,13,26,0.45) 62%, rgba(5,13,26,0.05) 100%)",
        }}
      />
      <div className="grid-pattern pointer-events-none absolute inset-0 -z-10" />
      <div
        className="anim-float pointer-events-none absolute -right-24 top-10 -z-10 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(201,163,92,0.28), transparent 70%)" }}
      />

      <div className="section-pad mx-auto flex min-h-[calc(100svh-72px)] max-w-wrap flex-col justify-center pb-10 pt-14 sm:pt-20 lg:min-h-[640px] lg:pt-24">
        <div className="max-w-[720px]">
          <div className="anim-fade-up inline-flex items-center gap-2.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-[10.5px] font-semibold uppercase tracking-[2.5px] text-gold-300 backdrop-blur-sm sm:text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400 shadow-[0_0_10px_#dcb977]" />
            Sovereign Capital Advisory
          </div>

          <h1
            className="display anim-fade-up mt-6 text-[44px] uppercase sm:text-[64px] lg:text-[78px]"
            style={{ animationDelay: "120ms" }}
          >
            Structuring
            <br />
            <span className="gold-text">Sovereign Capital.</span>
            <br />
            <span className="text-white/95">Delivering Global Impact.</span>
          </h1>

          <p
            className="anim-fade-up mt-6 max-w-[540px] text-[15px] font-light leading-[1.85] text-[#b9c6d8] sm:text-[17px]"
            style={{ animationDelay: "240ms" }}
          >
            HANNON INTERNATIONAL INVESTMENTS LTD is an independent financial advisory firm
            specializing in sovereign financing, capital structuring, and access to
            international funding for governments and global enterprises.
          </p>

          <div
            className="anim-fade-up mt-9 flex flex-col gap-3.5 sm:flex-row"
            style={{ animationDelay: "360ms" }}
          >
            <Link href="/projects" className="btn btn-gold">
              Explore Projects <span aria-hidden>→</span>
            </Link>
            <Link href="/contact" className="btn btn-outline">
              Send a proposal
            </Link>
          </div>
        </div>

        <div
          className="anim-fade-up mt-14 grid grid-cols-1 gap-3 sm:mt-16 sm:grid-cols-3 sm:gap-4"
          style={{ animationDelay: "500ms" }}
        >
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="glass group flex items-start gap-4 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/40 hover:bg-white/[0.1]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-500/15 text-gold-400 transition-colors group-hover:bg-gold-500 group-hover:text-navy-900">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[22px] w-[22px]"
                >
                  {p.icon}
                </svg>
              </span>
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[1.8px] text-white">
                  {p.title}
                </div>
                <p className="mt-1.5 text-[13px] font-light leading-[1.6] text-muted">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
    </section>
  );
}
