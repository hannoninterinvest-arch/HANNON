import Link from "next/link";
import Reveal from "./Reveal";

export default function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 140% at 50% 0%, rgba(201,163,92,0.2) 0%, transparent 65%)",
        }}
      />
      <div className="grid-pattern pointer-events-none absolute inset-0 opacity-70" />
      <div className="section-pad relative mx-auto max-w-wrap py-16 sm:py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="eyebrow justify-center text-gold-400">Let&apos;s work together</div>
          <h2 className="display mt-5 text-[34px] text-white sm:text-5xl">
            Ready to structure your <span className="gold-text">next transaction?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] font-light leading-[1.8] text-muted">
            Send us your proposal or your question. Our team will reply to the email
            address you provide.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link href="/contact" className="btn btn-gold w-full sm:w-auto">
              Send a proposal <span aria-hidden>→</span>
            </Link>
            <Link href="/services" className="btn btn-outline w-full sm:w-auto">
              Discover our services
            </Link>
          </div>
        </Reveal>
      </div>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
    </section>
  );
}
