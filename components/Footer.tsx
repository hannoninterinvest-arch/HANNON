import Image from "next/image";
import Link from "next/link";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/global-reach", label: "Global Reach" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Administration" },
];

const SERVICE_LINKS = [
  { href: "/services", label: "All services" },
  { href: "/contact", label: "Send a proposal" },
];

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-4 w-4",
};

function ContactRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start gap-3 text-[13px] font-light leading-relaxed text-muted">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold-500/30 text-gold-400">
        {icon}
      </span>
      <div className="pt-1">{children}</div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer id="contact" className="relative bg-navy-800 pt-16 text-[#c7d1e0] sm:pt-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
      <div className="section-pad mx-auto grid max-w-wrap grid-cols-1 gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1fr_1.5fr] lg:gap-12">
        <div>
          <Link href="/" className="flex items-center gap-3" aria-label="HANNON International Investments - home">
            <div className="relative h-12 w-12 shrink-0">
              <Image
                src="https://res.cloudinary.com/dbzweuzla/image/upload/v1786402383/logoha_lpe5ct.webp"
                alt="HANNON logo"
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <div>
              <div className="font-serif text-2xl font-bold leading-none tracking-[3px] text-white">
                HANNON
              </div>
              <div className="mt-1 text-[8.5px] uppercase tracking-[2.5px] text-gold-400">
                International Investments Ltd
              </div>
            </div>
          </Link>
          <p className="mt-6 font-serif text-[22px] font-medium leading-snug text-white/90">
            Structuring Sovereign Capital.
            <br />
            <span className="gold-text">Delivering Global Impact.</span>
          </p>
          <div className="mt-6 flex gap-2.5">
            <a
              href="#"
              aria-label="LinkedIn"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-xs font-bold text-muted transition-all hover:-translate-y-0.5 hover:border-gold-500 hover:bg-gold-500 hover:text-navy-900"
            >
              in
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[2.5px] text-white">
            Quick Links
          </h4>
          <ul>
            {QUICK_LINKS.map((link) => (
              <li key={link.href} className="mb-3">
                <Link
                  href={link.href}
                  rel={link.href === "/login" ? "nofollow" : undefined}
                  className="inline-block text-[13px] font-light text-muted transition-all hover:translate-x-1 hover:text-gold-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[2.5px] text-white">
            Services
          </h4>
          <ul>
            {SERVICE_LINKS.map((link) => (
              <li key={link.href} className="mb-3">
                <Link
                  href={link.href}
                  rel={link.href === "/login" ? "nofollow" : undefined}
                  className="inline-block text-[13px] font-light text-muted transition-all hover:translate-x-1 hover:text-gold-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[2.5px] text-white">
            Contact
          </h4>
          <ContactRow
            icon={
              <svg {...iconProps}>
                <path d="M3 6l9 7 9-7M3 6v12h18V6" />
              </svg>
            }
          >
            <a href="mailto:contact@hannoninterinvest.com" className="break-all hover:text-gold-400">
              contact@hannoninterinvest.com
            </a>
          </ContactRow>
          <ContactRow
            icon={
              <svg {...iconProps}>
                <path d="M3 5c0 9 7 16 16 16l3-4-6-3-2 2c-3-1.5-5-3.5-6-6l2-2-3-6z" />
              </svg>
            }
          >
            <a href="tel:+21656147900" className="hover:text-gold-400">
              +216 56 147 900
            </a>
          </ContactRow>
          <ContactRow
            icon={
              <svg {...iconProps}>
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z" />
              </svg>
            }
          >
            <a
              href="https://hannoninterinvest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold-400"
            >
              hannoninterinvest.com
            </a>
          </ContactRow>
          <ContactRow
            icon={
              <svg {...iconProps}>
                <path d="M12 21s7-6.4 7-12a7 7 0 10-14 0c0 5.6 7 12 7 12z" />
                <circle cx="12" cy="9" r="2.3" />
              </svg>
            }
          >
            <span>Immeuble Saadi, Tour EF, Menzah 4, Tunis 1082 - Tunisia</span>
          </ContactRow>
        </div>
      </div>

      <div className="border-t border-white/[0.08]">
        <div className="section-pad mx-auto flex max-w-wrap flex-col gap-3 py-6 text-[11.5px] text-muted-dark sm:flex-row sm:items-center sm:justify-between">
          <div>&copy; 2026 HANNON Sovereign Capital Advisory. All Rights Reserved.</div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="#" className="hover:text-gold-400">Privacy Policy</a>
            <a href="#" className="hover:text-gold-400">Terms of Use</a>
            <a href="#" className="hover:text-gold-400">Legal Notice</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
