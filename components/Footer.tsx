import Image from "next/image";
const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/#services", label: "Services" },
  { href: "/login", label: "Investor portal" },
];

const SERVICE_LINKS = [
  "Sovereign Financing Advisory",
  "Capital Raising",
  "Project & Infrastructure Finance",
  "Public-Private Partnerships",
  "Strategic Financial Structuring",
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-navy-800 pt-[70px] text-[#c7d1e0]">
      <div className="mx-auto grid max-w-wrap grid-cols-1 gap-[30px] px-10 pb-[50px] sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr_1fr]">
        <div>
        <a href="/" className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0">
            <Image
              src="https://res.cloudinary.com/dbzweuzla/image/upload/v1786402383/logoha_lpe5ct.webp"
              alt="HANNON logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <div className="font-serif text-xl font-bold leading-none tracking-[2px] text-white">
              HANNON
            </div>
            <div className="mt-[3px] text-[8.5px] uppercase tracking-[2.5px] text-gold-400">
              INTERNATIONAL INVESTMENTS LTD
            </div>
          </div>
        </a>
          <p className="mt-4 text-[12.5px] font-light leading-[1.8] text-muted">
            Structuring Sovereign Capital.
            <br />
            Delivering Global Impact.
          </p>
        </div>

        <div>
          <h4 className="mb-[18px] text-[11px] font-semibold uppercase tracking-[2px] text-white">
            Quick Links
          </h4>
          <ul>
            {QUICK_LINKS.map((link) => (
              <li key={link.href} className="mb-[11px]">
                <a href={link.href} className="text-[12.5px] font-light text-muted hover:text-gold-400">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-[18px] text-[11px] font-semibold uppercase tracking-[2px] text-white">
            Services
          </h4>
          <ul>
            {SERVICE_LINKS.map((label) => (
              <li key={label} className="mb-[11px]">
                <a href="/#services" className="text-[12.5px] font-light text-muted hover:text-gold-400">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-[18px] text-[11px] font-semibold uppercase tracking-[2px] text-white">
            Contact
          </h4>
          <div className="mb-3.5 flex items-start gap-2.5 text-[12.5px] font-light text-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 h-[15px] w-[15px] flex-shrink-0 text-gold-500">
              <path d="M3 6l9 7 9-7M3 6v12h18V6" />
            </svg>
            <a href="mailto:contact@hannoninterinvest.com" className="hover:text-gold-400">
              contact@hannoninterinvest.com
            </a>
          </div>

          <div className="mb-3.5 flex items-start gap-2.5 text-[12.5px] font-light text-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 h-[15px] w-[15px] flex-shrink-0 text-gold-500">
              <path d="M3 5c0 9 7 16 16 16l3-4-6-3-2 2c-3-1.5-5-3.5-6-6l2-2-3-6z" />
            </svg>
            <a href="tel:+21656147900" className="hover:text-gold-400">
              +216 56 147 900
            </a>
          </div>

          <div className="mb-3.5 flex items-start gap-2.5 text-[12.5px] font-light text-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 h-[15px] w-[15px] flex-shrink-0 text-gold-500">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z" />
            </svg>
            <a href="https://www.hannoninterinvest.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400">
              www.hannoninterinvest.com
            </a>
          </div>

          <div className="mb-3.5 flex items-start gap-2.5 text-[12.5px] font-light text-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 h-[15px] w-[15px] flex-shrink-0 text-gold-500">
              <path d="M12 21s7-6.4 7-12a7 7 0 10-14 0c0 5.6 7 12 7 12z" />
              <circle cx="12" cy="9" r="2.3" />
            </svg>
            <span>Immeuble Saadi, Tour EF, Menzah 4, Tunis 1082 - Tunisie</span>
          </div>
        </div>

        <div>
          <h4 className="mb-[18px] text-[11px] font-semibold uppercase tracking-[2px] text-white">
            Stay Connected
          </h4>
          <div className="flex gap-2.5">
            <a href="#" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-xs font-bold text-muted hover:border-gold-500 hover:text-gold-400">
              in
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-wrap flex-wrap justify-between gap-2.5 border-t border-white/[0.08] px-10 py-5 text-[11px] text-muted-dark">
        <div>&copy; 2026 HANNON Sovereign Capital Advisory. All Rights Reserved.</div>
        <div>
          <a href="#" className="ml-[18px] hover:text-gold-400">Privacy Policy</a>
          <a href="#" className="ml-[18px] hover:text-gold-400">Terms of Use</a>
          <a href="#" className="ml-[18px] hover:text-gold-400">Legal Notice</a>
        </div>
      </div>
    </footer>
  );
}