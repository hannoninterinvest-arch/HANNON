import Image from "next/image";

export default function GlobalReach() {
  return (
    <section className="grid grid-cols-1 bg-navy-900 text-white lg:grid-cols-2">
      {/* Global Reach panel */}
      <div
        id="reach"
        className="relative flex flex-col overflow-hidden border-b border-white/[0.07] lg:border-b-0 lg:border-r"
      >
        {/* Text block */}
        <div className="relative z-[1] px-6 pt-[70px] sm:px-[50px] sm:pt-[90px]">
          <div className="eyebrow text-gold-400">Global Reach</div>
          <h2 className="mt-3.5 text-[26px] font-bold uppercase leading-[1.25] text-white sm:text-[30px]">
            Operating Across{" "}
            <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent">
              Continents
            </span>
          </h2>
          <p className="mt-[18px] max-w-[420px] text-sm font-light leading-[1.8] text-muted">
            Operating across Africa, the Middle East, Europe, and Asia, we
            leverage an extensive network of financial institutions, private
            investors, and strategic partners to mobilize capital and drive
            transformation.
          </p>

          <a href="#reach" className="btn btn-outline mt-5 px-[22px] py-[11px] text-[10px]">
            Our Global Presence
          </a>
        </div>

        {/* Map block - separated, visible, not covered by text overlay */}
        <div className="relative mt-10 h-[220px] w-full sm:h-[260px]">
          <Image
            src="https://res.cloudinary.com/dbzweuzla/image/upload/v1786403692/footer_dyjgmz.webp"
            alt="Global network"
            fill
            className="object-cover object-center"
          />
          {/* Light gradient only at the top edge to blend with the text block above */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-16"
            style={{
              background: "linear-gradient(180deg, #0a1220 0%, transparent 100%)",
            }}
          />
          {/* Subtle gold glow to tie in with the palette without hiding the map */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(201,163,92,0.15) 0%, transparent 60%)",
            }}
          />
        </div>
      </div>

      {/* Leadership panel */}
      <div
        id="leadership"
        className="relative flex flex-col justify-center overflow-hidden px-6 py-[70px] sm:px-[50px] sm:py-[90px]"
      >
        <div
          className="pointer-events-none absolute -right-16 top-1/3 h-64 w-64 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(201,163,92,0.18), transparent 70%)" }}
        />

        <div className="relative z-[1]">
          <div className="eyebrow text-gold-400">Leadership</div>
          <div className="mt-5 grid grid-cols-1 items-start gap-[30px] sm:grid-cols-[180px_1fr]">
            <div className="relative h-[190px] w-[150px] overflow-hidden rounded-[2px] border border-gold-500/40 sm:h-[220px] sm:w-[180px]">
              <Image
                src="https://res.cloudinary.com/dbzweuzla/image/upload/v1786403136/WhatsApp_Image_2026-08-07_at_10.32.35_kzawur.jpg"
                alt="Riadh Ibn Chaouaa"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-serif text-2xl font-bold tracking-[0.5px] text-white">
                Riadh IBN CHAOUAA
              </div>
              <div className="my-[6px] text-[10.5px] font-semibold uppercase tracking-[2px] text-gold-400">
                Managing Director
              </div>
              <p className="text-[13px] font-light leading-[1.75] text-muted">
                Riadh Ibn Chaouaa leads HANNON Sovereign Capital Advisory with a
                focus on sovereign financial strategy, capital structuring, and
                international deal execution. He brings deep expertise in
                cross-border transactions and institutional advisory, with a
                strong track record of delivering innovative financing
                solutions for high-impact projects.
              </p>
              <a href="#contact" className="btn btn-outline mt-5 px-[22px] py-[11px] text-[10px]">
                View Full Profile →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}