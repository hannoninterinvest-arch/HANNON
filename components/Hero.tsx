import Image from "next/image";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-playfair",
});

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden pb-[60px] pt-[90px] text-white"
    >
      {/* Full-bleed background photo */}
      <Image
        src="https://res.cloudinary.com/dbzweuzla/image/upload/v1786386096/630292ea-2558-499a-b414-3180fabd058b.jfif_2K_202608101920_asse86.jpg"
        alt="City skyline"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Dégradé : sombre à gauche (texte lisible) → clair à droite (photo visible) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, #050d1a 0%, rgba(5,13,26,0.92) 25%, rgba(5,13,26,0.6) 50%, rgba(5,13,26,0.15) 80%, rgba(5,13,26,0) 100%)",
        }}
      />

      <div className="relative z-[2] mx-auto grid max-w-wrap grid-cols-1 items-center gap-5 px-10 lg:grid-cols-2">
        <div>
          <h1
            className={`${playfair.className} text-[36px] font-bold uppercase leading-[1.12] tracking-[0.5px] sm:text-[48px]`}
          >
            Structuring
            <br />
            <span className="text-gold-400">Sovereign Capital.</span>
            <br />
            Delivering Global Impact.
          </h1>
          <p className="mt-[22px] max-w-[460px] font-sans text-[15.5px] font-light leading-[1.75] text-muted">
            HANNON INTERNATIONAL INVESTMENTS LTD is an independent financial
            advisory firm specializing in sovereign financing, capital
            structuring, and access to international funding for governments
            and global enterprises.
          </p>
          <div className="mt-[34px] flex flex-wrap gap-4">
            <a href="#contact" className="btn btn-gold font-sans">
              Engage With Us →
            </a>
            <a href="#services" className="btn btn-outline font-sans">
              Explore Our Capabilities
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}