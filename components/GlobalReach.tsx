import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";

const REGIONS = ["Africa", "Middle East", "Europe", "Asia"];

export default function GlobalReach() {
  return (
    <section className="grid grid-cols-1 bg-navy-900 text-white lg:grid-cols-2">
      <div
        id="reach"
        className="relative flex flex-col overflow-hidden border-b border-white/[0.07] lg:border-b-0 lg:border-r"
      >
        <div className="relative z-[1] px-5 pt-16 sm:px-12 sm:pt-24">
          <Reveal>
            <div className="eyebrow text-gold-400">Global Reach</div>
            <h2 className="display mt-4 text-[34px] uppercase text-white sm:text-[44px]">
              Operating Across <span className="gold-text">Continents</span>
            </h2>
            <p className="mt-5 max-w-[460px] text-[15px] font-light leading-[1.85] text-muted">
              Operating across Africa, the Middle East, Europe, and Asia, we leverage an extensive
              network of financial institutions, private investors, and strategic partners to
              mobilize capital and drive transformation.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {REGIONS.map((region) => (
                <li
                  key={region}
                  className="rounded-full border border-gold-500/35 bg-gold-500/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[1.8px] text-gold-300"
                >
                  {region}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="btn btn-outline mt-7">
              Our Global Presence
            </Link>
          </Reveal>
        </div>

        <div className="relative mt-12 h-[240px] w-full sm:h-[320px]">
          <Image
            src="https://res.cloudinary.com/dbzweuzla/image/upload/v1786403692/footer_dyjgmz.webp"
            alt="Global network"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-center"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24"
            style={{ background: "linear-gradient(180deg, #060f1e 0%, transparent 100%)" }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(201,163,92,0.18) 0%, transparent 60%)",
            }}
          />
        </div>
      </div>

      <div
        id="leadership"
        className="relative flex flex-col justify-center overflow-hidden px-5 py-16 sm:px-12 sm:py-24"
      >
        <div
          className="pointer-events-none absolute -right-16 top-1/3 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(201,163,92,0.2), transparent 70%)" }}
        />

        <Reveal className="relative z-[1]">
          <div className="eyebrow text-gold-400">Leadership</div>
          <div className="glass mt-6 grid grid-cols-1 items-start gap-6 rounded-3xl p-5 sm:grid-cols-[190px_1fr] sm:gap-8 sm:p-7">
            <div className="relative mx-auto aspect-[4/5] w-[190px] overflow-hidden rounded-2xl border border-gold-500/40 shadow-[0_20px_40px_rgba(0,0,0,0.4)] sm:mx-0 sm:w-full">
              <Image
                src="https://res.cloudinary.com/dbzweuzla/image/upload/v1786403136/WhatsApp_Image_2026-08-07_at_10.32.35_kzawur.jpg"
                alt="Riadh Ibn Chaouaa"
                fill
                sizes="190px"
                className="object-cover"
              />
            </div>
            <div className="text-center sm:text-left">
              <div className="font-serif text-[28px] font-semibold leading-tight text-white">
                Riadh IBN CHAOUAA
              </div>
              <div className="mb-3 mt-1.5 text-[11px] font-semibold uppercase tracking-[2.5px] text-gold-400">
                Managing Director
              </div>
              <p className="text-[14px] font-light leading-[1.8] text-muted">
                Riadh Ibn Chaouaa leads HANNON Sovereign Capital Advisory with a focus on sovereign
                financial strategy, capital structuring, and international deal execution. He
                brings deep expertise in cross-border transactions and institutional advisory, with
                a strong track record of delivering innovative financing solutions for high-impact
                projects.
              </p>
              <a href="#contact" className="btn btn-outline mt-6">
                View Full Profile →
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
